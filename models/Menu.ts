import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenu extends Document {
  name: string;
  calories: number;
  riceType: string;
  description: string;
  healthNote: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  image: string;
  nutrient?: {
    carbohydrate?: number;
    protein?: number;
    fat?: number;
    fiber?: number;
  };
}

const MenuSchema = new Schema<IMenu>({
  name: String,
  calories: Number,
  riceType: String,
  description: String,
  healthNote: String,
  tags: [String],
  ingredients: [String],
  instructions: [String],
  image: String,
  nutrient: {
    protein: Number,
    carbohydrate: Number,
    fat: Number,
    fiber: Number,
  },
}, { timestamps: true });

const Menu: Model<IMenu> = mongoose.models.Menu || mongoose.model<IMenu>('Menu', MenuSchema, 'menus');
export default Menu;
