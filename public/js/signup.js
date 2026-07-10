import { showAlert } from './alert.js';

const signUpForm = document.querySelector('#form-signup');

const signUserUp = async (data) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: data,
            withCredentials: true
        });
        console.log(response);

        if (response.data.status === 'success') {
            window.setTimeout(() => {
                location.assign('/me');
            }, 1500);
            showAlert('success', 'Logged In Successfully');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword =
            document.getElementById('confirmPassword').value;

        const data = { name, email, password, confirmPassword };
        console.log(data);

        signUserUp(data);
    });
}
