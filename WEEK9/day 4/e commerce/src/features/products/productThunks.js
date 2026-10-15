import {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
} from './productSlice';

const API_URL = 'https://fakestoreapi.com/products';

export const fetchProducts =
  (limit = 8) =>
  async (dispatch) => {
    dispatch(fetchProductsRequest());
    try {
      const response = await fetch(`${API_URL}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const products = await response.json();
      dispatch(fetchProductsSuccess(products));
    } catch (error) {
      dispatch(fetchProductsFailure(error.message));
    }
  };
