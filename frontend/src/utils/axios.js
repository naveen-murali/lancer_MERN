import axios from 'axios';

export const axiosConfig = axios.create({
    baseURL: 'https://lancer.unityshop.shop/api'
});