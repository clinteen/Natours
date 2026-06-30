import { showAlert } from './alert.js';
// import { loadStripe } from '@stripe/stripe-js';

const stripe = Stripe(
    'pk_test_51Tl8hdK0iaqhPeAgFkjSLGkQWWU0iEyqVHDI4a49tLZsT1xVW9C53k0JjGlMVAKAaom09EKa84asVOM9UKZzDUW400iyWyNvaW'
);
// const stripe = await loadStripe(
//     'pk_test_51Tl8hdK0iaqhPeAgFkjSLGkQWWU0iEyqVHDI4a49tLZsT1xVW9C53k0JjGlMVAKAaom09EKa84asVOM9UKZzDUW400iyWyNvaW'
// );

// var stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
const bookBtn = document.getElementById('book_btn');

const payFunction = async (tourId) => {
    try {
        // 1.) Get checkout session from the server or API
        const session = await axios(
            `/api/v1/bookings/booking-session/${tourId}`
        );
        // console.log(session);

        // 2.) Create checkout form and charge client
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // });

        // This method is used to redirect the user to the Stripe Checkout page using the session URL returned from the server. It sets the window location to the session URL, which initiates the payment process. {This is a simpler approach compared to using the session ID with redirectToCheckout. It is used for the newer or updated Stripe Checkout integration.}

        window.location.href = session.data.session_url;
    } catch (err) {
        showAlert('error', err);
        // console.log(err);
    }
};

if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
        e.target.textContent = 'processing...';

        const tourId = e.target.dataset.tourId;

        payFunction(tourId);
    });
}
