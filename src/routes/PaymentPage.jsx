import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/PaymentPage.css';
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe('pk_test_51RJ04ECAJzOytYHCLzu91P0UwZBrRPrk9RFO5Prr1OX7c9poQCLEZl5PRJthUDivPsaqoBih1oTiup0Agi5FdJpj00oXrr0YHi');

const CheckoutForm = ({ appointmentId, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [paymentAmount, setPaymentAmount] = useState(null);

  useEffect(() => {
    axios.post('http://localhost:3131/stripe/create-payment', {
      appointmentId: appointmentId
    })
    .then(res => {
      setClientSecret(res.data.clientSecret);
      setPaymentAmount(res.data.amount);
    })
    .catch(err => {
      const userMessage = err.response?.data?.error || "Payment could not be initiated.";
      showPopup(userMessage, "error");
      setError(userMessage);
    });
  }, [appointmentId]);

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: '' }), 4000);
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#333',
        fontFamily: '"Poppins", sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#aaa',
        },
      },
      invalid: {
        color: '#f44336',
        iconColor: '#f44336',
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (processing || succeeded || !stripe || !elements || !clientSecret) {
      if (!clientSecret) {
        setError("Payment information not loaded yet.");
        showPopup("Payment information not loaded yet.", "error");
      }
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: name,
          email: email,
        },
      },
    });

    if (paymentError) {
      let userErrorMessage = paymentError.message;
      if (paymentError.type !== "card_error" && paymentError.type !== "validation_error") {
        userErrorMessage = "Unexpected error during payment.";
      }
      setError(userErrorMessage);
      showPopup(userErrorMessage, "error");
      setProcessing(false);
      if (onPaymentError) onPaymentError(paymentError);
    } else if (paymentIntent.status === 'succeeded') {
      setError(null);
      setSucceeded(true);
      setProcessing(false);
      showPopup("Payment completed successfully!", "success");
      if (onPaymentSuccess) onPaymentSuccess(paymentIntent);  
        
        axios.post('http://localhost:3131/stripe/confirm-payment', {
          appointmentId: appointmentId
        }).then((res) => {
          if (res.data.status === "done") {
            showPopup("Payment confirmed!");
            setTimeout(() => {
              navigate("/dashboard");  
            }, 6000);
            
          } else {
            showPopup("Payment cancelled, try again!");
          }
        })
        .catch(err => {
          const userMessage = err.response?.data?.error || "Payment could not be done.";
          showPopup(userMessage, "error");
          setError(userMessage);
        });
      
    } else {
      setError(`Payment status: ${paymentIntent.status}`);
      showPopup(`Payment status: ${paymentIntent.status}`, "error");
      setProcessing(false);
    }
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      {popup.show && (
        <div className={`popup ${popup.type}`}>{popup.message}</div>
      )}
      <h2 className="title">Secure Payment</h2>
      {paymentAmount && (
        <div className="payment-amount-display">
          <p>Payment Amount: <strong>{paymentAmount} USD</strong></p>
        </div>
      )}

      <div className="input-field">
        <i className="fas fa-user" />
        <input
          id="name"
          type="text"
          placeholder="Cardholder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={processing || succeeded}
          aria-label="Cardholder Name"
        />
      </div>

      <div className="input-field">
        <i className="fas fa-envelope" />
        <input
          id="email"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={processing || succeeded}
          aria-label="Email Address"
        />
      </div>

      <div className="input-field">
        <i className="fas fa-credit-card" />
        <div className="card-element-wrapper">
          <CardElement id="card-element" options={cardElementOptions} />
        </div>
      </div>

      {error && <div className="card-error" role="alert">{error}</div>}

      <button
        type="submit"
        className="btn solid"
        disabled={processing || !stripe || !elements || succeeded || !clientSecret}
      >
        {processing ? "Processing..." : "Pay"}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const { appointmentId } = useParams();

  const handleSuccess = (paymentIntent) => {
    console.log('Payment Successful:', paymentIntent);
  };

  const handleError = (error) => {
    console.error('Payment Error:', error);
  };

  return (
    <div className="container1 payment-container">

      <div className="top-right-logo" />
      <div className="forms-container">
        <div className="signin-signup">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              appointmentId={appointmentId}
              onPaymentSuccess={handleSuccess}
              onPaymentError={handleError}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
