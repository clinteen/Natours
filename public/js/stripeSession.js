import { showAlert } from './alert.js';
// import { loadStripe } from '@stripe/stripe-js';

// const stripe = Stripe(
//     'pk_test_51Tl8hdK0iaqhPeAgFkjSLGkQWWU0iEyqVHDI4a49tLZsT1xVW9C53k0JjGlMVAKAaom09EKa84asVOM9UKZzDUW400iyWyNvaW'
// );
// const stripe = await loadStripe(
//     'pk_test_51Tl8hdK0iaqhPeAgFkjSLGkQWWU0iEyqVHDI4a49tLZsT1xVW9C53k0JjGlMVAKAaom09EKa84asVOM9UKZzDUW400iyWyNvaW'
// );

// var stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const bookBtn = document.getElementById('book_btn');
const select_field = document.getElementById('select_btn');
const review_Btn = document.getElementById('review_btn');
const review_Form = document.querySelector('.review_Form');
const review_Form_btn = document.querySelector('.submit_review');
const review_stars = document.querySelectorAll('.stars');

let star;
// console.log(select_field.value);

const payFunction = async (tourId) => {
    try {
        // 1.) Get checkout session from the server or API
        const session = await axios.get(
            `/api/v1/bookings/booking-session/${tourId}`,
            {
                params: {
                    startDate: select_field.value
                }
            }
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

const postReview = async (tourId, data) => {
    try {
        const response = axios({
            method: 'POST',
            url: `/api/v1/tours/${tourId}/reviews`,
            data
        });

        if (response.status === 'success') {
            showAlert('success', `Review Posted successfully!`);
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    } catch (err) {
        console.log(err.response.data);
    }
};

if (bookBtn) {
    bookBtn.addEventListener('click', async (e) => {
        // console.log(option.value);
        e.target.textContent = 'processing...';

        const tourId = e.target.dataset.tourId;

        payFunction(tourId);
    });
}

if (review_Btn) {
    review_Btn.addEventListener('click', (e) => {
        e.preventDefault();

        review_Form.style.display = 'flex';
    });
}

if (review_stars) {
    review_stars.forEach((item, current_index) => {
        item.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('id');
            star = id;

            review_stars.forEach((el, ind) => {
                if (ind <= current_index) {
                    el.classList.add('reviews__star--active');
                    el.classList.remove('reviews__star--inactive');
                } else {
                    el.classList.remove('reviews__star--active');
                    el.classList.add('reviews__star--inactive');
                }
            });
        });
    });
}

if (review_Form_btn) {
    review_Form_btn.addEventListener('click', (e) => {
        e.preventDefault();

        const tourId = document.querySelector('#review_btn').dataset.tourId;

        const review = document.querySelector('#review').value;
        const rating = star;

        postReview(tourId, { review, rating });
    });
}
