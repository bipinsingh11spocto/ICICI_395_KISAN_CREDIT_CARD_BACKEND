const { default: axios } = require('axios');

const httpClient = {
    get: (url) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(url);
                resolve(response);
            } catch (error) {
                if (error.response) {
                    reject(error.response.data);
                } else if (error.request) {
                    reject(error.request.data);
                } else {
                    reject(error);
                }
            }
        });
    },
    post: (url, data, headers) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(url, data);
                resolve(response);
            } catch (error) {
                if (error.response) {
                    reject(error.response.data);
                } else if (error.request) {
                    reject(error.request.data);
                } else {
                    reject(error);
                }
            }
        });
    },
    config: (payload) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios(payload);
                resolve(response);
            } catch (error) {
                reject(error)
            }
        });
    }
};

module.exports = { httpClient };