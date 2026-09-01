// backend/src/utils/deliveryTemplates.js

const templates = {
  // 1. Yalidine
  yalidine: {
    fileName: 'yalidine_orders',
    columns: [
      { header: 'Tracking', key: 'tracking', width: 18 },
      { header: 'Nom Client', key: 'customerName', width: 22 },
      { header: 'Telephone', key: 'phone', width: 16 },
      { header: 'Wilaya', key: 'wilaya', width: 18 },
      { header: 'Commune', key: 'city', width: 18 },
      { header: 'Adresse', key: 'address', width: 25 },
      { header: 'Montant COD', key: 'codPrice', width: 14 },
      { header: 'Produit', key: 'product', width: 24 },
      { header: 'Stopdesk', key: 'stopdesk', width: 12 },
      { header: 'Remarque', key: 'notes', width: 25 }
    ],
    mapRow: (order) => ({
      tracking: order._id.toString().slice(-8).toUpperCase(),
      customerName: order.customerName,
      phone: order.phone,
      wilaya: order.wilaya,
      city: order.city,
      address: order.deliveryType === 'desk' ? 'STOP DESK' : order.city,
      codPrice: (order.price || 0) + (order.deliveryPrice || 0),
      product: order.product,
      stopdesk: order.deliveryType === 'desk' ? 'OUI' : 'NON',
      notes: order.notes || ''
    })
  },

  // 2. ZR Express
  zr: {
    fileName: 'zr_express_orders',
    columns: [
      { header: 'Client', key: 'customerName', width: 22 },
      { header: 'Telephone', key: 'phone', width: 16 },
      { header: 'Wilaya Destinataire', key: 'wilaya', width: 18 },
      { header: 'Commune Destinataire', key: 'city', width: 18 },
      { header: 'Type de Livraison', key: 'deliveryType', width: 18 },
      { header: 'Montant', key: 'codPrice', width: 14 },
      { header: 'Designation Produit', key: 'product', width: 24 },
      { header: 'Observations', key: 'notes', width: 25 }
    ],
    mapRow: (order) => ({
      customerName: order.customerName,
      phone: order.phone,
      wilaya: order.wilaya,
      city: order.city,
      deliveryType: order.deliveryType === 'desk' ? 'Bureau (Stop Desk)' : 'Domicile',
      codPrice: (order.price || 0) + (order.deliveryPrice || 0),
      product: order.product,
      notes: order.notes || ''
    })
  },

  // 3. Maystro Delivery
  maystro: {
    fileName: 'maystro_orders',
    columns: [
      { header: 'Customer Name', key: 'customerName', width: 22 },
      { header: 'Phone Number', key: 'phone', width: 16 },
      { header: 'Wilaya', key: 'wilaya', width: 18 },
      { header: 'Commune', key: 'city', width: 18 },
      { header: 'Address', key: 'address', width: 25 },
      { header: 'Total Price', key: 'codPrice', width: 14 },
      { header: 'Products Description', key: 'product', width: 24 },
      { header: 'Is Stopdesk', key: 'isStopdesk', width: 12 },
      { header: 'Note', key: 'notes', width: 25 }
    ],
    mapRow: (order) => ({
      customerName: order.customerName,
      phone: order.phone,
      wilaya: order.wilaya,
      city: order.city,
      address: order.deliveryType === 'desk' ? 'Bureau Maystro' : order.city,
      codPrice: (order.price || 0) + (order.deliveryPrice || 0),
      product: order.product,
      isStopdesk: order.deliveryType === 'desk' ? 'TRUE' : 'FALSE',
      notes: order.notes || ''
    })
  },

  // 4. Procolis / Ecom
  procolis: {
    fileName: 'procolis_orders',
    columns: [
      { header: 'Nom Destinataire', key: 'customerName', width: 22 },
      { header: 'Telephone', key: 'phone', width: 16 },
      { header: 'Wilaya', key: 'wilaya', width: 18 },
      { header: 'Commune', key: 'city', width: 18 },
      { header: 'Type Envoi', key: 'deliveryType', width: 16 },
      { header: 'Prix Global', key: 'codPrice', width: 14 },
      { header: 'Contenu', key: 'product', width: 24 },
      { header: 'Remarques', key: 'notes', width: 25 }
    ],
    mapRow: (order) => ({
      customerName: order.customerName,
      phone: order.phone,
      wilaya: order.wilaya,
      city: order.city,
      deliveryType: order.deliveryType === 'desk' ? 'STOPDESK' : 'DOMICILE',
      codPrice: (order.price || 0) + (order.deliveryPrice || 0),
      product: order.product,
      notes: order.notes || ''
    })
  }
};

module.exports = templates;