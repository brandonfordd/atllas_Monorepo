import {Router} from 'express';
console.log('IRoute module is being loaded');
export default interface IRoute {
  /**
   * The router's root. Passed directly to express.use(), so "/users" would map to
   * "localhost:50000/users"
   */
  
  route: string;

  /**
   * The actual router object.
   */
  router(): Router;
}
