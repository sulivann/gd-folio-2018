import Loader from 'resource-loader';

export default (ctx, inject) => {
  inject('loader', Loader);
}
