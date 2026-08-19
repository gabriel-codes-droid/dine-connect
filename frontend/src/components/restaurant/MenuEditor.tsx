import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Upload } from 'lucide-react';
import { menuService } from '../../firebase';
import type { MenuItem } from '../../data/restaurants';
import { auth } from '../../services/auth';

interface MenuEditorProps {
  restaurantId: string;
}

export default function MenuEditor({ restaurantId }: MenuEditorProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  const session = auth.getSession();

  useEffect(() => {
    loadMenuItems();
  }, [restaurantId]);

  async function loadMenuItems() {
    try {
      setLoading(true);
      const items = await menuService.getMenuItems(restaurantId);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(item: Partial<MenuItem>) {
    try {
      if (editingItem) {
        await menuService.updateMenuItem(restaurantId, editingItem.id, item);
      } else if (isAdding) {
        await menuService.addMenuItem(restaurantId, item as Omit<MenuItem, 'id'>);
      }
      setEditingItem(null);
      setIsAdding(false);
      await loadMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await menuService.deleteMenuItem(restaurantId, id);
      await loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>, itemId: string) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await menuService.uploadMenuItemImage(restaurantId, itemId, file);
      await menuService.updateMenuItem(restaurantId, itemId, { image: imageUrl });
      await loadMenuItems();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (!session || session.role !== 'restaurant-admin') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Only restaurant admins can edit the menu.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Menu Management</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {isAdding && (
        <MenuItemForm
          item={{}}
          onSave={handleSave}
          onCancel={() => setIsAdding(false)}
          uploading={uploading}
          onImageUpload={(e) => e.target.files?.[0] && handleImageUpload(e, 'temp')}
        />
      )}

      <div className="space-y-3">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {editingItem?.id === item.id ? (
              <MenuItemForm
                item={editingItem}
                onSave={handleSave}
                onCancel={() => setEditingItem(null)}
                uploading={uploading}
                onImageUpload={(e) => handleImageUpload(e, item.id)}
              />
            ) : (
              <div className="flex items-start gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-600 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {menuItems.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500">
          <p>No menu items yet. Click "Add Item" to create your first menu item.</p>
        </div>
      )}
    </div>
  );
}

interface MenuItemFormProps {
  item: Partial<MenuItem>;
  onSave: (item: Partial<MenuItem>) => void;
  onCancel: () => void;
  uploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function MenuItemForm({ item, onSave, onCancel, uploading, onImageUpload }: MenuItemFormProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: item.name || '',
    description: item.description || '',
    price: item.price || 0,
    category: item.category || 'Starters',
    image: item.image || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price || formData.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price || 0}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={2}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItem['category'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="Starters">Starters</option>
          <option value="Mains">Mains</option>
          <option value="Desserts">Desserts</option>
          <option value="Drinks">Drinks</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        <div className="flex items-center gap-4">
          {formData.image && (
            <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
          )}
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload size={18} />
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={18} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {item.id ? 'Update' : 'Add'} Item
        </button>
      </div>
    </form>
  );
}
