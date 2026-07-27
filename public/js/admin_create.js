import { showAlert } from './alert.js';

const date_btn = document.querySelector('#add-date');
const location_btn = document.querySelector('#add-location');
const start_location_btn = document.querySelector('#add-start-location');
const date_form = document.querySelector('.dates');
const location_form = document.querySelector('.locations');
const start_location_form = document.querySelector('.start_location');
const locations_div = document.querySelector('.locations_div');
const start_location_div = document.querySelector('.start_location_div');
const dates_div = document.querySelector('.dates_div');
// let guides_divs = document.querySelectorAll('.guide_container');
const guides_btns = document.querySelectorAll('.add_guides');
// const guides_fields_1 = document.querySelector('#guides_field_1');
// const guides_fields_2 = document.querySelector('#guides_field_2');
const tour_form = document.querySelector('#create_tour_form');
const user_form = document.querySelector('#create_user_form');
const review_form = document.querySelector('#create_review_form');
const booking_form = document.querySelector('#create_booking_form');
const like_btns = document.querySelectorAll('.like_btn img');
const containers = document.querySelectorAll('.container_all');
const back_drops = document.querySelector('.back_drops');
const x = document.querySelectorAll('.x');
const body = document.querySelector('body');
const edit_review = document.querySelector('.user_update_review_btn');
const delete_review = document.querySelector('.user_del_review_btn');
const edit_review_form = document.querySelector('.edit_review_Form');
const edit_review_dropdown = document.querySelector('.drop_down_edit_review');
const submit_edit_review = document.querySelector('#edit_review');
const review_stars = document.querySelectorAll('.stars');
const hamburger_open = document.querySelector('.hamburger_menu');
const hamburger_closed = document.querySelector('.x_menu');
const side_menu = document.querySelector('.side_menu');
const side_menu_dropdown = document.querySelector('.side_menu_dropdown');

const delete_resource_btn = document.querySelectorAll('.delete_resource');

const res = await fetch('/tour-guides');
const tourGuides = await res.json();

let star;
let guides = [];
let date_container = [];
let location_container = [];
let startLocation_div = {};

let startLocation = {};
let locations = [];
let dates = [];
let i = 1;

const alertMessage = body.dataset.alert;

if (alertMessage) {
    showAlert('success', alertMessage, 20);
}

if (hamburger_open) {
    hamburger_open.addEventListener('click', (e) => {
        side_menu.style.transform = 'translateX(0)';
        side_menu_dropdown.style.display = 'block';
        side_menu_dropdown.style.opacity = 1;
    });

    hamburger_closed.addEventListener('click', (e) => {
        side_menu.style.transform = 'translateX(100%)';
        side_menu_dropdown.style.display = 'none';
        side_menu_dropdown.style.opacity = 0;
    });
}

if (side_menu_dropdown) {
    side_menu_dropdown.addEventListener('click', (e) => {
        side_menu.style.transform = 'translateX(100%)';
        side_menu_dropdown.style.display = 'none';
        side_menu_dropdown.style.opacity = 0;
    });
}

if (back_drops) {
    back_drops.addEventListener('click', (e) => {
        body.removeAttribute('style');
        back_drops.style.display = 'none';

        date_form.style.display = 'none';
        date_form.reset();

        location_form.style.display = 'none';
        location_form.reset();

        start_location_form.style.display = 'none';
        start_location_form.reset();
    });
}

x.forEach((el) => {
    el.addEventListener('click', (e) => {
        e.target.parentElement.remove();
    });
});

const create_select_element = (role, element) => {
    let select = document.createElement('select');
    select.classList = 'form__input available';
    select.setAttribute('name', role);

    tourGuides.tourGuides.forEach((el) => {
        const option = document.createElement('option');
        option.setAttribute('value', el._id);
        option.innerHTML = el.name;

        if (el.role === role) select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        const div = document.createElement('div');
        const p = document.createElement('p');
        const span = document.createElement('span');

        div.className = 'guide_container';
        p.setAttribute('data-guide-id', select.value);
        p.innerHTML = select.options[select.selectedIndex].text;
        span.innerHTML = 'x';
        span.classList = 'x';

        div.appendChild(p);
        div.appendChild(span);

        element.appendChild(div);
        e.target.remove();
    });

    return select;
};

if (like_btns.length > 0) {
    like_btns.forEach((el) => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();

            const liked = e.target.dataset.liked === 'true';

            el.src = liked ? '/img/heart_1.png' : '/img/heart_2.png';
            el.dataset.liked = `${!liked}`;

            const tourId = e.target.dataset.tourId;

            try {
                const response = await axios({
                    method: 'POST',
                    url: `/api/v1/users/add-favourites/${tourId}`,
                    favorites: tourId
                });
            } catch (err) {
                console.log(err.response.data);
            }
        });
    });
}

if (guides_btns.length > 0) {
    guides_btns[0].addEventListener('click', (e) => {
        e.preventDefault();

        const available = document.querySelector('.available');
        if (available) {
            return;
        }

        containers[3].appendChild(
            create_select_element('guide', containers[3])
        );

        // console.log(create_select_element('guide'));

        // console.log(tourGuides);
    });

    guides_btns[1].addEventListener('click', (e) => {
        e.preventDefault();

        const available = document.querySelector('.available');
        if (available) {
            return;
        }

        containers[4].appendChild(
            create_select_element('lead-guide', containers[4])
        );
    });
}

if (date_btn) {
    date_btn.addEventListener('click', (e) => {
        e.preventDefault();

        body.style.overflow = 'hidden';
        back_drops.style.display = 'block';
        date_form.style.display = 'block';
    });
}

if (location_btn) {
    location_btn.addEventListener('click', (e) => {
        e.preventDefault();

        body.style.overflow = 'hidden';
        location_form.style.display = 'block';
        back_drops.style.display = 'block';
    });
}

if (start_location_btn) {
    start_location_btn.addEventListener('click', (e) => {
        e.preventDefault();

        body.style.overflow = 'hidden';
        back_drops.style.display = 'block';
        start_location_form.style.display = 'block';
    });
}

if (date_form) {
    date_form.addEventListener('submit', (e) => {
        e.preventDefault();

        let date_input = document.getElementById('date').value;
        let participants_input = document.getElementById('participants').value;
        let sold_out_input = document.getElementById('sold_out').value;

        const date_data = {
            date: date_input,
            participants: participants_input,
            soldOut: sold_out_input
        };
        dates.push(date_data);

        body.removeAttribute('style');
        back_drops.style.display = 'none';

        date_form.style.display = 'none';
        date_form.reset();

        const new_date = `<div class='date_container container'>
                            <h3 class='x'> x
                            <h5> ${date_data.date} </h5>
                            <h6> ${date_data.participants} </h6>
                            <p> ${date_data.soldOut} </p> 
                        </div>`;

        // dates_div.insertAdjacentHTML('beforeend', new_date);
        containers[0].insertAdjacentHTML('afterend', new_date);

        console.log(dates);
    });
}

if (location_form) {
    location_form.addEventListener('submit', (e) => {
        e.preventDefault();

        let cod_1 = document.getElementById('coordinates_1').value;
        let cod_2 = document.getElementById('coordinates_2').value;

        let day = document.getElementById('day').value;
        let loc_description = document.getElementById('description_loc').value;
        let address = document.getElementById('address').value;
        let type = document.getElementById('type').value;
        let coordinates = [Number(cod_2), Number(cod_1)];

        const location_data = {
            day,
            description: loc_description,
            address,
            type,
            coordinates
        };

        locations.push(location_data);

        const new_location = `<div class='locations_container container' >
                                <h3 class='x'> x </h3> 
                                <h5> ${location_data.type} </h5>
                                <h6> ${location_data.coordinates} </h6>
                                <h5> ${location_data.address} </h5>
                                <h5> ${location_data.description}</h5>
                                <h5> ${location_data.day} </h5>
                            </div>`;

        // locations_div.insertAdjacentHTML('afterbegin', new_location);
        containers[2].insertAdjacentHTML('beforeend', new_location);
        i++;

        body.removeAttribute('style');
        back_drops.style.display = 'none';

        location_form.style.display = 'none';
        location_form.reset();

        console.log(locations);
    });
}

if (start_location_form) {
    start_location_form.addEventListener('submit', (e) => {
        e.preventDefault();

        let cod_1 = document.getElementById('start_loc_coordinates_1').value;
        let cod_2 = document.getElementById('start_loc_coordinates_2').value;

        let loc_description = document.getElementById(
            'start_loc_description_loc'
        ).value;
        let address = document.getElementById('start_loc_address').value;
        let type = document.getElementById('start_loc_type').value;
        let coordinates = [Number(cod_2), Number(cod_1)];

        startLocation = {
            description: loc_description,
            address,
            type,
            coordinates
        };

        const new_start_location = `<div class='container start_location_container'>
                                        <h3 class='x'> x
                                        <h5> ${startLocation.type} <h5>
                                        <h6> ${startLocation.coordinates} </h6>
                                        <h5> ${startLocation.address} </h5>
                                        <h5> ${startLocation.description} </h5>
                                    </div>`;

        // start_location_div.innerHTML = '';
        // start_location_div.insertAdjacentHTML('afterbegin', new_start_location);

        containers[1].innerHTML = '';
        containers[1].insertAdjacentHTML('beforeend', new_start_location);

        body.removeAttribute('style');
        back_drops.style.display = 'none';

        start_location_form.style.display = 'none';
        start_location_form.reset();
    });
}

const tour_objects = (obj) => {
    let guides_divs = Array.from(document.querySelectorAll('.guide_container'));
    const date_divs = Array.from(document.querySelectorAll('.date_container'));
    const location_divs = Array.from(
        document.querySelectorAll('.locations_container')
    );
    const start_location_container = document.querySelector(
        '.start_location_container'
    );

    date_divs.forEach((el) => {
        const date = new Date(el.children[1].innerHTML).toISOString();
        const participants = Number(el.children[2].innerHTML);
        const soldOut = el.children[3].innerHTML.trim();

        const date_data = {
            date,
            participants,
            soldOut
        };
        date_container.push(date_data);
        console.log(date_container);
    });

    location_divs.forEach((el) => {
        const coord_arr = el.children[2].innerHTML.split(',');

        const type = el.children[1].innerHTML;
        const coordinates = [Number(coord_arr[1]), Number(coord_arr[2])];
        const address = el.children[3].innerHTML;
        const description = el.children[4].innerHTML;
        const day = el.children[5].innerHTML;

        const date_data = {
            type,
            coordinates,
            address,
            description,
            day
        };
        location_container.push(date_data);
    });

    guides_divs.forEach((el) => {
        const guides_id = el.children[0].dataset.guideId;

        guides.push(guides_id);
        // console.log(guides);
    });

    const start_cod = start_location_container.children[2].innerHTML.split(',');

    startLocation_div = {
        type: start_location_container.children[1].innerHTML,
        coordinates: [Number(start_cod[0]), Number(start_cod[1])],
        address: start_location_container.children[3].innerHTML,
        description: start_location_container.children[4].innerHTML
    };

    console.log(date_container, location_container, guides);

    obj.append('startDates', JSON.stringify(date_container));
    obj.append('startLocation', JSON.stringify(startLocation_div));
    obj.append('locations', JSON.stringify(location_container));
    obj.append('guides', JSON.stringify(guides));
};

const create_Tour = async (data) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/tours',
            data: data
        });

        // if (response.data.status === 'success') {
        //     showAlert('success', `${type.toUpperCase()} updated successfully!`);
        //     // location.reload(true);
        // }
    } catch (err) {
        console.log(err.response.data);
    }
};

const create_User = async (data) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users',
            data: data
        });
    } catch (err) {
        console.log(err.response.data);
    }
};

const create_Review = async (data) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/reviews/admin',
            data: data
        });
    } catch (err) {
        console.log(err.response.data);
    }
};

const create_Booking = async (data) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/bookings',
            data: data
        });
    } catch (err) {
        console.log(err.response.data);
    }
};

const delete_Resource = async (id, resource) => {
    const url = `/api/v1/${resource}/${id}`;

    try {
        const response = await axios({
            method: 'DELETE',
            url
        });

        if (response.status === 204) {
            showAlert(
                'success',
                `${resource.toUpperCase()} deleted successfully!`
            );
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    } catch (err) {
        console.log(err.response.data);
    }
};

const update_Resource = async (id, resource, method, data, message) => {
    try {
        const response = await axios({
            method,
            url: `/api/v1/${resource}/${id}`,
            data
        });

        if (response.data.status === 'success') {
            showAlert(
                'success',
                `${resource.toUpperCase()} ${message} successfully!`
            );
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    } catch (err) {
        console.log(err.response.data);
    }
};

if (edit_review_dropdown) {
    edit_review_dropdown.addEventListener('click', (e) => {
        edit_review_dropdown.style.display = 'none';
        edit_review_form.style.display = 'none';
        body.removeAttribute('style');
    });
}

if (edit_review) {
    edit_review.addEventListener('click', () => {
        edit_review_dropdown.style.display = 'block';
        edit_review_form.style.display = 'flex';
        body.style.overflow = 'hidden';
    });

    review_stars.forEach((item) => {
        item.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('id');
            star = id;
        });
    });

    submit_edit_review.addEventListener('click', (e) => {
        e.preventDefault();
        const review_id = edit_review.dataset.reviewId;
        const review = document.querySelector('textarea').value;
        const rating = star;
        const data = { rating, review };

        update_Resource(review_id, 'reviews', 'PATCH', data, 'updated');

        edit_review_dropdown.style.display = 'none';
        edit_review_form.style.display = 'none';
        body.removeAttribute('style');
    });
}

if (tour_form) {
    tour_form.addEventListener('submit', (e) => {
        e.preventDefault();

        const form = new FormData();

        form.append('name', document.getElementById('tour_name').value);
        form.append('duration', document.getElementById('tour_duration').value);
        form.append(
            'maxGroupSize',
            document.getElementById('maxGroupSize').value
        );
        form.append('difficulty', document.getElementById('difficulty').value);
        form.append('price', document.getElementById('price').value);
        form.append(
            'priceDiscount',
            document.getElementById('price_discount').value
        );
        form.append('summary', document.getElementById('summary').value);
        form.append(
            'description',
            document.getElementById('description').value
        );
        // FRONTEND

        form.append('SecretTour', document.getElementById('secret_tour').value);
        // form.append('imageCover', document.getElementById('image_cover').files);
        // form.append('images', document.getElementById('images').files);

        const imageCoverInput = document.getElementById('image_cover');
        if (imageCoverInput.files[0]) {
            form.append('imageCover', imageCoverInput.files[0]);
        }

        // ✅ MULTIPLE IMAGES - loop them
        const imagesInput = document.getElementById('images');
        for (let i = 0; i < imagesInput.files.length; i++) {
            form.append('images', imagesInput.files[i]);
        }

        const route_action =
            document.querySelector('#tours_btn').dataset.action;
        const tour_id = document.querySelector('#tours_btn').dataset.tourId;

        if (route_action === 'create') {
            if (dates.length > 0) {
                form.append('startDates', JSON.stringify(dates));
            }
            // form.append('startDates', JSON.stringify(dates));
            form.append('startLocation', JSON.stringify(startLocation));
            form.append('locations', JSON.stringify(locations));

            const guide = document.getElementById('guides').value;
            const lead_guide = document.getElementById('lead-guides').value;
            guides.push(guide);
            guides.push(lead_guide);
            form.append('guides', JSON.stringify(guides));

            create_Tour(form);
        } else if (route_action === 'update') {
            tour_objects(form);

            update_Resource(tour_id, 'tours', 'PATCH', form, 'updated');
        }
    });
}

if (user_form) {
    user_form.addEventListener('submit', (e) => {
        e.preventDefault();

        const form = new FormData();

        form.append('name', document.querySelector('#name').value);
        form.append('email', document.querySelector('#email').value);
        form.append('role', document.querySelector('#role').value);
        form.append('active', document.querySelector('#active').value);
        form.append('photo', document.querySelector('#photo').files[0]);

        const route_action =
            document.querySelector('#users_btn').dataset.action;
        const user_id = document.querySelector('#users_btn').dataset.userId;

        if (route_action === 'create') {
            form.append('password', document.querySelector('#password').value);
            form.append(
                'confirmPassword',
                document.querySelector('#confirm_password').value
            );
            create_User(form);
        } else if (route_action === 'update') {
            update_Resource(user_id, 'users', 'PATCH', form, 'updated');
        }
    });
}

if (review_form) {
    review_form.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.querySelector('#users').value;
        const tour = document.querySelector('#tours').value;
        const review = document.querySelector('#review').value;
        console.log(review);
        const rating = document.querySelector('#rating').value;

        const data = {
            user,
            tour,
            review,
            rating
        };

        const route_action =
            document.querySelector('#review_btn').dataset.action;
        const review_id =
            document.querySelector('#review_btn').dataset.reviewId;

        if (route_action === 'create') {
            create_Review(data);
        } else if (route_action === 'update') {
            update_Resource(review_id, 'reviews', 'PATCH', data, 'Updated');
        }
    });
}

if (booking_form) {
    booking_form.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.querySelector('#users').value;
        const tour = document.querySelector('#tours').value;
        const price = document.querySelector('#price').value;
        const paid = document.querySelector('#paid').value;
        const startDate = document.querySelector('#startDate').value;

        const data = { user, tour, price, paid, startDate };

        const route_action =
            document.querySelector('#bookings_btn').dataset.action;
        const booking_id =
            document.querySelector('#bookings_btn').dataset.bookingId;

        if (route_action === 'create') {
            create_Booking(data);
        } else if (route_action === 'update') {
            update_Resource(booking_id, 'bookings', 'PATCH', data, 'updated');
        }
    });
}

if (delete_resource_btn) {
    delete_resource_btn.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const resource = e.target.dataset.resource;

            delete_Resource(id, resource);
        });
    });
}
