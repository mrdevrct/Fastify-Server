const mongoose = require("mongoose");
const Category = require("../model/category.model");
const Product = require("../../product/model/product.model");
const { logger } = require("../../../utils/logger/logger");

const categoryService = {
  createCategory: async (categoryData, user) => {
    try {
      if (categoryData.parentId) {
        const parent = await Category.findById(categoryData.parentId);
        if (!parent) throw new Error("Parent category not found");

        let depth = 0;
        let current = parent;
        while (current && current.parentId && depth < 4) {
          depth++;
          current = await Category.findById(current.parentId);
        }
        if (depth >= 4)
          throw new Error("Maximum category depth exceeded (4 levels)");
      }

      const newCategory = new Category({
        name: categoryData.name,
        parentId: categoryData.parentId || null,
        description: categoryData.description || "",
        image: categoryData.image || "",
        metaTitle: categoryData.metaTitle,
        metaDescription: categoryData.metaDescription,
      });

      await newCategory.save();
      return newCategory;
    } catch (error) {
      logger.error(`Error creating category: ${error.message}`);
      throw error;
    }
  },

  getCategories: async (filters = {}, options = {}) => {
    try {
      const query = {};
      if (filters.parentId)
        query.parentId = filters.parentId === "null" ? null : filters.parentId;
      if (filters.slug) query.slug = filters.slug;

      const categories = await Category.find(query).sort({ createdAt: -1 });

      if (options.tree) {
        return buildCategoryTree(categories);
      }

      return categories;
    } catch (error) {
      logger.error(`Error fetching categories: ${error.message}`);
      throw error;
    }
  },

  getCategory: async (identifier) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { slug: identifier };

      const category = await Category.findOne(query);
      if (!category) throw new Error("Category not found");

      return category;
    } catch (error) {
      logger.error(`Error fetching category: ${error.message}`);
      throw error;
    }
  },

  updateCategory: async (categoryId, updateData, user) => {
    try {
      const category = await Category.findById(categoryId);
      if (!category) throw new Error("Category not found");

      if (
        updateData.parentId &&
        updateData.parentId !== category.parentId?.toString()
      ) {
        const parent = await Category.findById(updateData.parentId);
        if (!parent) throw new Error("Parent category not found");

        let depth = 0;
        let current = parent;
        while (current && current.parentId && depth < 4) {
          depth++;
          current = await Category.findById(current.parentId);
        }
        if (depth >= 4)
          throw new Error("Maximum category depth exceeded (4 levels)");

        const subCategories = await getAllSubCategories(categoryId);
        if (
          subCategories.includes(updateData.parentId) ||
          updateData.parentId === categoryId
        ) {
          throw new Error("Cannot set a subcategory or self as parent");
        }
      }

      if (updateData.name) category.name = updateData.name;
      if (updateData.description !== undefined)
        category.description = updateData.description;
      if (updateData.image !== undefined) category.image = updateData.image;
      if (updateData.metaTitle) category.metaTitle = updateData.metaTitle;
      if (updateData.metaDescription)
        category.metaDescription = updateData.metaDescription;
      if (updateData.parentId !== undefined)
        category.parentId = updateData.parentId || null;

      category.updatedAt = new Date();
      await category.save();

      return category;
    } catch (error) {
      logger.error(`Error updating category: ${error.message}`);
      throw error;
    }
  },

  deleteCategory: async (categoryId, options = {}) => {
    try {
      const category = await Category.findById(categoryId);
      if (!category) throw new Error("Category not found");

      const subCategories = await getAllSubCategories(categoryId);
      const categoriesToCheck = [categoryId, ...subCategories];
      const productCount = await Product.countDocuments({
        categoryId: { $in: categoriesToCheck },
      });

      if (productCount > 0 && !options.force) {
        throw new Error("Cannot delete category with associated products");
      }

      if (options.newParentId) {
        const newParent = await Category.findById(options.newParentId);
        if (!newParent) throw new Error("New parent category not found");

        await Category.updateMany(
          { parentId: categoryId },
          { parentId: options.newParentId }
        );
      } else {
        await Category.updateMany({ parentId: categoryId }, { parentId: null });
      }

      await category.remove();
      return true;
    } catch (error) {
      logger.error(`Error deleting category: ${error.message}`);
      throw error;
    }
  },
};

function buildCategoryTree(categories) {
  const map = {};
  const tree = [];

  categories.forEach((category) => {
    map[category._id] = { ...category.toObject(), children: [] };
  });

  categories.forEach((category) => {
    if (category.parentId && map[category.parentId]) {
      map[category.parentId].children.push(map[category._id]);
    } else {
      tree.push(map[category._id]);
    }
  });

  return tree;
}

async function getAllSubCategories(categoryId) {
  const subCategories = [];
  const queue = [categoryId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await Category.find({ parentId: currentId }).select("_id");
    for (const child of children) {
      subCategories.push(child._id.toString());
      queue.push(child._id);
    }
  }

  return subCategories;
}

module.exports = { categoryService };
