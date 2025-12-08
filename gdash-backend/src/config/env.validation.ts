import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(8).required(),
  JWT_EXPIRATION: Joi.alternatives(
    Joi.string(), // aceita "1h", "3600s"
    Joi.number()  // aceita 3600
  ).default('1h')
});