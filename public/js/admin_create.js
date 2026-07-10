import { showAlert } from './alert.js';

const date_btn = document.querySelector('#add-date');
const location_btn = document.querySelector('#add-location');
const date_form = document.querySelector('.dates');
const location_form = document.querySelector('.locations');
const start_location_container = document.querySelector('.locations_div');
const tour_form = document.querySelector('#create_tour_form');

let locations = [];
let dates = [];
let i = 1;

if (date_btn) {
    date_btn.addEventListener('click', (e) => {
        e.preventDefault();

        date_form.style.display = 'block';
    });
}

if (location_btn) {
    location_btn.addEventListener('click', (e) => {
        e.preventDefault();

        location_form.style.display = 'block';
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

        date_form.style.display = 'none';
        date_form.reset();

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
        let coordinates = [Number(cod_1), Number(cod_2)];

        const location_data = {
            day,
            description: loc_description,
            address,
            type,
            coordinates
        };

        locations.push(location_data);

        const new_location = `<div>
                                <h1> Location ${i}</h2>
                                <h2>${location_data.address}</h1>
                                <h3>${location_data.coordinates}</h2>
                                <span> X </span>
                            </div>`;

        start_location_container.insertAdjacentHTML('beforeend', new_location);
        i++;

        location_form.style.display = 'none';
        location_form.reset();

        console.log(locations);
    });
}

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
        if (dates.length > 0) {
            form.append('startDates', JSON.stringify(dates));
        }
        // form.append('startDates', JSON.stringify(dates));
        form.append('locations', JSON.stringify(locations));
        form.append('guides', document.getElementById('guides').value);
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

        create_Tour(form);
    });
}
