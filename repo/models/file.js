import { DataTypes } from "sequelize";
import { sequelize } from "../../db/sequelize.js";

export const File = sequelize.define(
  "files",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stored_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "files",
    timestamps: true,

    //CRITICAL FIXES
    createdAt: "created_at", // map createdAt → created_at
    updatedAt: false, // disable updatedAt completely
  }
);
