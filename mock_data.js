const mockZones = [
    { id: 'zone-A', x: 20, y: 20, w: 20, h: 20, label: 'Gate A', density: 'high' },
    { id: 'zone-B', x: 60, y: 20, w: 20, h: 20, label: 'Gate B', density: 'low' },
    { id: 'zone-C', x: 40, y: 40, w: 20, h: 20, label: 'Concourse', density: 'medium' },
    { id: 'zone-D', x: 40, y: 60, w: 20, h: 20, label: 'Section 104', density: 'medium' },
    { id: 'zone-outside', x: 50, y: 90, w: 10, h: 10, label: 'Outside', density: 'low' },
    { id: 'zone-center', x: 45, y: 45, w: 10, h: 10, label: 'Center', density: 'high' }
];

const mockAmenities = [
    {
        id: 'food-1', name: 'Primo Pizza', type: 'food', location: 'Section 101', waitTime: 5, status: 'low', canOrder: true,
        menu: [
            { id: 'item-1', name: 'Pepperoni Slice', price: 6.00 },
            { id: 'item-2', name: 'Cheese Slice', price: 5.00 },
            { id: 'item-3', name: 'Soda', price: 4.00 }
        ]
    },
    {
        id: 'food-2', name: 'Stadium Hot Dogs', type: 'food', location: 'Gate B Concourse', waitTime: 12, status: 'medium', canOrder: true,
        menu: [
            { id: 'item-4', name: 'Classic Chili Dog', price: 7.50 },
            { id: 'item-5', name: 'Jumbo Pretzel', price: 5.50 },
            { id: 'item-6', name: 'Draft Beer', price: 9.00 }
        ]
    },
    {
        id: 'food-3', name: 'Gourmet Burgers', type: 'food', location: 'Section 108', waitTime: 25, status: 'high', canOrder: true,
        menu: [
            { id: 'item-7', name: 'Double Cheeseburger', price: 12.00 },
            { id: 'item-8', name: 'Crispy Fries', price: 6.50 },
            { id: 'item-9', name: 'Milkshake', price: 7.00 }
        ]
    },
    {
        id: 'food-4', name: 'Healthy Wraps', type: 'food', location: 'Gate A', waitTime: 3, status: 'low', canOrder: false
    },
    { id: 'rest-1', name: "Men's Restroom", type: 'restroom', location: 'Gate A', waitTime: 2, status: 'low' },
    { id: 'rest-2', name: "Women's Restroom", type: 'restroom', location: 'Gate B', waitTime: 8, status: 'medium' },
    { id: 'rest-3', name: "Unisex Restroom", type: 'restroom', location: 'Concourse', waitTime: 1, status: 'low' }
];
