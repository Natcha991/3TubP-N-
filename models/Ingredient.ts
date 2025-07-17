// models/Ingredient.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IngredientDocument extends Document {
  name: string;
  description?: string;
  image?: string;
  price?: string;
  shopLinks?: Record<string, string>; // ถ้าคุณมี link ร้านค้าเก็บใน object
}

const IngredientSchema = new Schema<IngredientDocument>(
  {
    name: { type: String, required: true },
    description: String,
    image: String,
    price: String,
    shopLinks: { type: Schema.Types.Mixed }, // รองรับ object shops
  },
  { timestamps: true }
);

const Ingredient: Model<IngredientDocument> =
  mongoose.models.Ingredient || mongoose.model<IngredientDocument>('Ingredient', IngredientSchema, 'ingredients');

export default Ingredient;
