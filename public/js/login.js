import { showAlert } from './alert.js';

const form = document.querySelector('#form-login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('#password-form');

const login = async (email, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });

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

const logOut = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });

        if (response.data.status === 'success') location.reload(true);
    } catch (err) {
        showAlert('error', 'Error Logging Out! Please try again');
    }
};

// type can only be data or password: For checking the type of data being passed
const updateSettings = async (data, type) => {
    try {
        const url =
            type === 'password'
                ? '/api/v1/users/update-password'
                : '/api/v1/users/updateMe';

        const response = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (response.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`);
            // location.reload(true);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logOut);
}

if (updateForm) {
    updateForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // This method is for the form data

        const form = new FormData();

        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateSettings(form, 'data');

        // This method is when we are not using form data, that is uploading files. If we are using form data in the html page, We set the attribute enctype='multipart/form-data'.

        // const name = document.getElementById('name').value;
        // const email = document.getElementById('email').value;

        // console.log(name, email);
        // updateSettings({ name, email }, 'data');
    });
}

if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        document.getElementById('btn_save').textContent = 'updating...';

        const oldpassword = document.getElementById('password-current').value;
        const newpassword = document.getElementById('password').value;
        const confirmPassword =
            document.getElementById('password-confirm').value;

        await updateSettings(
            { oldpassword, newpassword, confirmPassword },
            'password'
        );

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';

        document.getElementById('btn_save').textContent = 'save password';
    });
}
