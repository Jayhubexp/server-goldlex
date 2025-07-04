import React, { useState, useEffect } from 'react';
import { CarModal } from './CarModal';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  images: string[];
  status: 'available' | 'sold' | 'reserved' | 'maintenance';
  specifications: {
    engine?: string;
    transmission: string;
    fuelType: string;
    color?: string;
    seats?: number;
    drivetrain?: string;
    vin?: string;
    features?: string[];
  };
  description?: string;
}

interface CarsResponse {
  success: boolean;
  data: Car[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export const CarsTab: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://goldlex-auto-backend.vercel.app/api';

  const loadCars = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cars?limit=50`);
      const data: CarsResponse = await response.json();

      if (data.success) {
        setCars(data.data);
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;

    try {
      const response = await fetch(`${API_BASE}/cars/${carId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        loadCars();
      } else {
        alert('Error deleting car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Error deleting car');
    }
  };

  const getCarStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-red-100 text-red-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setShowModal(true);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCar(null);
    loadCars();
  };

  useEffect(() => {
    loadCars();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Cars Management</h2>
            <button
              onClick={handleAddCar}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Add New Car
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCarStatusColor(car.status)}`}>
                    {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{car.mileage.toLocaleString()} miles</p>
                <p className="text-xl font-bold text-green-600 mb-4">${car.price.toLocaleString()}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCar(car)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteCar(car._id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <CarModal
          car={editingCar}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};