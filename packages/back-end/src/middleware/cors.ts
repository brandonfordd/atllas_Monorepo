import {NextFunction, Request, Response} from 'express';

export default function CorsStar(req: Request, res: Response, next: NextFunction) {
  //added local host to cors allow origin, might need to change this to your own
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Added more CORS Access Controls to make sure cookie gets set to headers
  next();
}

