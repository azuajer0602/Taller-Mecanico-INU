const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Rutas de la API

// Clientes
app.get('/api/clientes', (req, res) => {
  db.query('SELECT * FROM cliente', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/clientes', (req, res) => {
  const { cedula, nombre, apellido, correo, direccion, telefono } = req.body;
  db.query('INSERT INTO cliente (cedula, nombre, apellido, correo, direccion, telefono) VALUES (?, ?, ?, ?, ?, ?)',
    [cedula, nombre, apellido, correo, direccion, telefono], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Cliente creado' });
  });
});

// Vehículos
app.get('/api/vehiculos', (req, res) => {
  db.query('SELECT v.*, c.nombre, c.apellido FROM vehiculo v JOIN cliente c ON v.id_cliente = c.id_cliente', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/vehiculos', (req, res) => {
  const { matricula, id_cliente, año, color, marca, modelo } = req.body;
  db.query('INSERT INTO vehiculo (matricula, id_cliente, año, color, marca, modelo) VALUES (?, ?, ?, ?, ?, ?)',
    [matricula, id_cliente, año, color, marca, modelo], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Vehículo creado' });
  });
});

// Servicios
app.get('/api/servicios', (req, res) => {
  db.query('SELECT * FROM servicio', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Repuestos
app.get('/api/repuestos', (req, res) => {
  db.query('SELECT * FROM repuesto', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Órdenes de trabajo
app.get('/api/ordenes', (req, res) => {
  db.query(`
    SELECT ot.*, d.descrip_falla, v.matricula, v.marca, v.modelo, c.nombre, c.apellido
    FROM orden_de_trabajo ot
    LEFT JOIN diagnostico d ON ot.num_diagnostico = d.num_diagnostico
    LEFT JOIN vehiculo v ON d.id_vehiculo = v.matricula
    LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/ordenes', (req, res) => {
  const { fecha_inicio, fecha_estimada, fecha_fin, estado, num_diagnostico } = req.body;
  db.query('INSERT INTO orden_de_trabajo (fecha_inicio, fecha_estimada, fecha_fin, estado, num_diagnostico) VALUES (?, ?, ?, ?, ?)',
    [fecha_inicio, fecha_estimada, fecha_fin, estado, num_diagnostico], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Orden creada' });
  });
});

// Diagnósticos
app.get('/api/diagnosticos', (req, res) => {
  db.query('SELECT * FROM diagnostico', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/diagnosticos', (req, res) => {
  const { id_vehiculo, fecha_ingreso, descrip_falla } = req.body;
  db.query('INSERT INTO diagnostico (id_vehiculo, fecha_ingreso, descrip_falla) VALUES (?, ?, ?)',
    [id_vehiculo, fecha_ingreso, descrip_falla], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Diagnóstico creado' });
  });
});

// Facturas
app.get('/api/facturas', (req, res) => {
  db.query(`
    SELECT f.*, c.nombre, c.apellido, ot.fecha_inicio, ot.fecha_fin
    FROM factura f
    JOIN cliente c ON f.id_cliente = c.id_cliente
    LEFT JOIN orden_de_trabajo ot ON f.id_order = ot.id_order
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/facturas', (req, res) => {
  const { fecha_fact, estado_pago, id_cliente, id_order, metodo_pago } = req.body;
  db.query('INSERT INTO factura (fecha_fact, estado_pago, id_cliente, id_order, metodo_pago) VALUES (?, ?, ?, ?, ?)',
    [fecha_fact, estado_pago, id_cliente, id_order, metodo_pago], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Factura creada' });
  });
});

// Gastos
app.get('/api/gastos', (req, res) => {
  db.query('SELECT g.*, cg.nombre_cate FROM gasto g LEFT JOIN categoria_gasto cg ON g.id_cate_gasto = cg.id_cate_gasto', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/gastos', (req, res) => {
  const { fecha_gasto, monto_gasto, descp_gasto, tipo_gasto, id_cate_gasto, metodo_pago } = req.body;

  // Validación de campos
  if (!fecha_gasto || !monto_gasto || !descp_gasto || !tipo_gasto || !metodo_pago) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios: fecha, monto, descripción, categoría y método de pago.' });
  }
  if (isNaN(parseFloat(monto_gasto)) || parseFloat(monto_gasto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
  }

  db.query('INSERT INTO gasto (fecha_gasto, monto_gasto, descp_gasto, tipo_gasto, id_cate_gasto, metodo_pago) VALUES (?, ?, ?, ?, ?, ?)',
    [fecha_gasto, monto_gasto, descp_gasto, tipo_gasto, id_cate_gasto, metodo_pago], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Gasto creado' });
  });
});

app.put('/api/gastos/:id', (req, res) => {
  const { id } = req.params;
  const { fecha_gasto, monto_gasto, descp_gasto, tipo_gasto, id_cate_gasto, metodo_pago } = req.body;

  // Validación de campos
  if (!fecha_gasto || !monto_gasto || !descp_gasto || !tipo_gasto || !metodo_pago) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  if (isNaN(parseFloat(monto_gasto)) || parseFloat(monto_gasto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
  }

  db.query(
    'UPDATE gasto SET fecha_gasto = ?, monto_gasto = ?, descp_gasto = ?, tipo_gasto = ?, id_cate_gasto = ?, metodo_pago = ? WHERE id_gasto = ?',
    [fecha_gasto, monto_gasto, descp_gasto, tipo_gasto, id_cate_gasto, metodo_pago, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
      res.json({ message: 'Gasto actualizado exitosamente' });
    }
  );
});

app.delete('/api/gastos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM gasto WHERE id_gasto = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ message: 'Gasto eliminado exitosamente' });
  });
});

// Empleados
app.get('/api/empleados', (req, res) => {
  db.query('SELECT * FROM empleado', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Categorías de gasto
app.get('/api/categorias-gasto', (req, res) => {
  db.query('SELECT * FROM categoria_gasto', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Dashboard - métricas
app.get('/api/dashboard/metrics', (req, res) => {
  const queries = {
    vehiculosReparados: 'SELECT COUNT(*) as count FROM orden_de_trabajo WHERE estado = "Completado"',
    vehiculosEsteMes: 'SELECT COUNT(*) as count FROM orden_de_trabajo WHERE MONTH(fecha_fin) = MONTH(CURRENT_DATE()) AND YEAR(fecha_fin) = YEAR(CURRENT_DATE()) AND estado = "Completado"',
    mecanicos: 'SELECT COUNT(*) as count FROM empleado WHERE cargo LIKE "%mecanic%"',
    mecanicosActivos: 'SELECT COUNT(*) as count FROM empleado WHERE cargo LIKE "%mecanic%"',
    ingresosMes: 'SELECT COALESCE(SUM(monto_pagado), 0) as total FROM pago_realizado WHERE MONTH(fecha_pago) = MONTH(CURRENT_DATE()) AND YEAR(fecha_pago) = YEAR(CURRENT_DATE())',
    ingresosMesAnterior: 'SELECT COALESCE(SUM(monto_pagado), 0) as total FROM pago_realizado WHERE MONTH(fecha_pago) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) AND YEAR(fecha_pago) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))',
    serviciosActivos: 'SELECT COUNT(*) as count FROM orden_de_trabajo WHERE estado IN ("En progreso", "Pendiente")'
  };

  const results = {};

  const executeQuery = (key, query) => {
    return new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) reject(err);
        else {
          if (key.includes('ingresos')) {
            results[key] = result[0].total;
          } else {
            results[key] = result[0].count;
          }
          resolve();
        }
      });
    });
  };

  Promise.all(Object.entries(queries).map(([key, query]) => executeQuery(key, query)))
    .then(() => res.json(results))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Dashboard - vehículos recientes
app.get('/api/dashboard/vehiculos-recientes', (req, res) => {
  db.query(`
    SELECT ot.fecha_inicio, v.matricula as placa, v.marca, v.modelo, c.nombre as cliente, ot.estado,
           COALESCE(SUM(dr.precio_unitario_cobrado * dr.cantidad_usada), 0) + COALESCE(SUM(s.precio_base), 0) as costo
    FROM orden_de_trabajo ot
    JOIN diagnostico d ON ot.num_diagnostico = d.num_diagnostico
    JOIN vehiculo v ON d.id_vehiculo = v.matricula
    JOIN cliente c ON v.id_cliente = c.id_cliente
    LEFT JOIN detalles_servicio ds ON ot.id_order = ds.id_order
    LEFT JOIN servicio s ON ds.id_servicio = s.id_servicio
    LEFT JOIN detalle_repuesto dr ON ot.id_order = dr.id_order
    GROUP BY ot.id_order
    ORDER BY ot.fecha_inicio DESC
    LIMIT 4
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Dashboard - servicios recientes
app.get('/api/dashboard/servicios-recientes', (req, res) => {
  db.query(`
    SELECT s.nombre_servicio as tipo, v.marca, v.modelo, e.nombre_emp as mecanico, ot.fecha_inicio as fecha,
           s.precio_base as costo, ot.estado, 'Media' as prioridad
    FROM orden_de_trabajo ot
    JOIN diagnostico d ON ot.num_diagnostico = d.num_diagnostico
    JOIN vehiculo v ON d.id_vehiculo = v.matricula
    LEFT JOIN detalles_servicio ds ON ot.id_order = ds.id_order
    LEFT JOIN servicio s ON ds.id_servicio = s.id_servicio
    LEFT JOIN empleado e ON e.id_empleado = (SELECT id_empleado FROM empleado LIMIT 1)
    ORDER BY ot.fecha_inicio DESC
    LIMIT 4
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Dashboard - ingresos recientes
app.get('/api/dashboard/ingresos-recientes', (req, res) => {
  db.query(`
    SELECT pr.fecha_pago as fecha, c.nombre as cliente, v.marca, v.modelo, pr.monto_pagado as monto,
           e.nombre_emp as mecanico, 'Servicio General' as servicio
    FROM pago_realizado pr
    JOIN empleado e ON pr.id_empleado = e.id_empleado
    LEFT JOIN cliente c ON c.id_cliente = (SELECT id_cliente FROM cliente LIMIT 1)
    LEFT JOIN vehiculo v ON v.id_cliente = c.id_cliente
    ORDER BY pr.fecha_pago DESC
    LIMIT 5
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
