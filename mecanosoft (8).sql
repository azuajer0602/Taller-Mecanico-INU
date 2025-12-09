-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-12-2025 a las 04:33:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mecanosoft`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria_gasto`
--

CREATE TABLE `categoria_gasto` (
  `id_cate_gasto` int(11) NOT NULL,
  `nombre_cate` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `direccion` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `Estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`cedula`, `nombre`, `apellido`, `id_cliente`, `correo`, `direccion`, `telefono`, `Estado`) VALUES
('10636307', 'Maria', 'Romero', 3, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 1),
('106363010', 'Maria', 'Romerotee', 4, 'mariamilagro@gmail.coms', 'La Miel', '0424528464', 0),
('10446307', 'Maria', 'Romero', 6, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 1),
('10444407', 'Maria', 'Romero', 7, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 0),
('10475865', 'Maria', 'Romera', 9, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 1),
('104745565', 'Maria', 'Romera', 10, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 0),
('147522565', 'Maria', 'Romera', 11, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 0),
('14733565', 'Maria', 'Romera', 12, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 1),
('15866565', 'Maria', 'Romera', 13, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 0),
('21586987', 'Jose', 'Perez', 16, 'josesitoperez@gmail.com', 'La Mielci', '04160196347', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra_repuesto`
--

CREATE TABLE `compra_repuesto` (
  `id_compra_repuesto` int(11) NOT NULL,
  `precio_unitario_compra` decimal(10,0) NOT NULL,
  `fecha_compra` datetime NOT NULL,
  `cantidad_comprada` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `concepto_cobro`
--

CREATE TABLE `concepto_cobro` (
  `id_concepto_cuenta_por_cobrar` int(11) NOT NULL,
  `monto_a_cobrar` decimal(10,0) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado_cobro` varchar(45) NOT NULL,
  `id_factura` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `concepto_pago`
--

CREATE TABLE `concepto_pago` (
  `id_concepto_cuenta_por_pagar` int(11) NOT NULL,
  `monto_a_pagar` decimal(10,0) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado_pago` varchar(45) NOT NULL,
  `id_compra_repuesto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_servicio`
--

CREATE TABLE `detalles_servicio` (
  `id_order` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_repuesto`
--

CREATE TABLE `detalle_repuesto` (
  `id_order` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL,
  `cantidad_usada` int(11) NOT NULL,
  `precio_unitario_cobrado` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_transaccion`
--

CREATE TABLE `detalle_transaccion` (
  `id_detalle` int(11) NOT NULL,
  `id_transaccion` int(11) NOT NULL,
  `debe` decimal(18,2) NOT NULL DEFAULT 0.00,
  `haber` decimal(18,2) NOT NULL DEFAULT 0.00,
  `descripcion_detalle` varchar(200) DEFAULT NULL,
  `es_cuenta_por_pagar` tinyint(1) NOT NULL DEFAULT 0,
  `es_cuenta_por_cobrar` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_vencimiento` date DEFAULT NULL,
  `Tipo_de_pago` varchar(40) NOT NULL,
  `id_tipo_transaccion_fk` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_transaccion`
--

INSERT INTO `detalle_transaccion` (`id_detalle`, `id_transaccion`, `debe`, `haber`, `descripcion_detalle`, `es_cuenta_por_pagar`, `es_cuenta_por_cobrar`, `fecha_vencimiento`, `Tipo_de_pago`, `id_tipo_transaccion_fk`) VALUES
(96, 53, 500000.00, 0.00, 'Herramientas de mecanica  (Bolívares)', 0, 0, NULL, 'Bolívares', 20),
(97, 53, 0.00, 500000.00, 'Capital social en acciones', 0, 0, NULL, 'Bolívares', 20),
(98, 54, 5000000.00, 0.00, 'Aporte de socios  (Bolívares)', 0, 0, NULL, 'Bolívares', 20),
(99, 54, 0.00, 5000000.00, 'Capital social en acciones', 0, 0, NULL, 'Bolívares', 20),
(100, 55, 100000.00, 0.00, 'Venta de mercancia a Saldivia Motors (Pago Móvil)', 0, 0, NULL, 'Pago Móvil', 22),
(101, 55, 0.00, 100000.00, 'Venta de mercancía', 0, 0, NULL, 'Pago Móvil', 22),
(102, 56, 20000.00, 0.00, 'Servicios profesionales', 0, 0, NULL, 'Pago Móvil', 29),
(103, 56, 0.00, 20000.00, 'Gasto en comunnity manager (Pago Móvil)', 0, 0, NULL, 'Pago Móvil', 29),
(104, 57, 50000.00, 0.00, 'Venta de mercancia a Motors del este C.A (Bolívares)', 0, 0, NULL, 'Bolívares', 22),
(105, 57, 0.00, 50000.00, 'Venta de mercancía', 0, 0, NULL, 'Bolívares', 22),
(106, 58, 50.00, 0.00, 'Efectivo en bancos', 0, 0, NULL, 'Bolívares', 3),
(107, 58, 0.00, 50.00, 'Deposito de efectivo (Bolívares)', 0, 0, NULL, 'Bolívares', 3),
(108, 59, 5000.00, 0.00, 'Cuentas por pagar', 0, 0, '2025-12-15', 'Bolívares', 18),
(109, 59, 0.00, 5000.00, 'Pago de administradora mes de julio (Bolívares)', 0, 0, NULL, 'Bolívares', 18),
(110, 60, 15350.00, 0.00, 'Cuentas por Cobrar a Clientes', 0, 0, '2025-12-30', 'Pago Móvil', 37),
(111, 60, 0.00, 15350.00, 'Reparacion de vehiculo A cliente Juan Perez  (Pago Móvil)', 0, 0, NULL, 'Pago Móvil', 37);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diagnostico`
--

CREATE TABLE `diagnostico` (
  `num_diagnostico` int(11) NOT NULL,
  `id_vehiculo` varchar(15) NOT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `descrip_falla` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `id_empleado` int(11) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `nombre_emp` varchar(255) NOT NULL,
  `apellido_emp` varchar(255) NOT NULL,
  `cedula_emp` varchar(255) NOT NULL,
  `cargo` varchar(255) NOT NULL,
  `fecha_contratacion` datetime NOT NULL,
  `sueldo_base` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`id_empleado`, `usuario`, `contrasena`, `nombre_emp`, `apellido_emp`, `cedula_emp`, `cargo`, `fecha_contratacion`, `sueldo_base`) VALUES
(31, 'rei', '1234', 'reimil', 'azuaje', '31663399', 'Administrador', '2025-11-20 00:00:00', 5000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL,
  `fecha_fact` date NOT NULL,
  `estado_pago` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `metodo_pago` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `ClienteId` int(11) NOT NULL,
  `fechaPago` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'Pendiente',
  `metodoPago` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gasto`
--

CREATE TABLE `gasto` (
  `id_gasto` int(11) NOT NULL,
  `fecha_gasto` date NOT NULL,
  `monto_gasto` decimal(10,2) NOT NULL,
  `descp_gasto` tinytext NOT NULL,
  `tipo_gasto` varchar(45) NOT NULL,
  `id_cate_gasto` int(11) NOT NULL,
  `metodo_pago` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `itemfacturas`
--

CREATE TABLE `itemfacturas` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_de_trabajo`
--

CREATE TABLE `orden_de_trabajo` (
  `id_order` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_estimada` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` varchar(20) NOT NULL,
  `num_diagnostico` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago_realizado`
--

CREATE TABLE `pago_realizado` (
  `id_pago_realizado` int(11) NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto_pagado` decimal(10,2) NOT NULL,
  `concepto_pago` varchar(45) NOT NULL,
  `id_empleado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL,
  `nombre_fiscal` varchar(255) NOT NULL,
  `rif_juridico` int(11) NOT NULL,
  `telefono_proveedor` varchar(255) NOT NULL,
  `direccion_proveedor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`id_proveedor`, `nombre_fiscal`, `rif_juridico`, `telefono_proveedor`, `direccion_proveedor`) VALUES
(0, 'Saldivia Car Motors Lara', 25475478, '04226584485', 'Este de Barquisimeto'),
(1, 'Chevrolete', 14877242, '04120971138', 'barquisimeto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuesto`
--

CREATE TABLE `repuesto` (
  `id_repuesto` int(11) NOT NULL,
  `nombre_repuesto` varchar(255) NOT NULL,
  `precio_unitario` decimal(10,0) DEFAULT NULL,
  `stock_inventario` int(11) DEFAULT NULL,
  `desc_repuesto` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `repuesto`
--

INSERT INTO `repuesto` (`id_repuesto`, `nombre_repuesto`, `precio_unitario`, `stock_inventario`, `desc_repuesto`) VALUES
(14, 'amortiguador', 20, 14, 'pieza para amotiguacion');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `id_servicio` int(11) NOT NULL,
  `nombre_servicio` varchar(45) NOT NULL,
  `description` tinytext NOT NULL,
  `precio_base` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifa_empleado`
--

CREATE TABLE `tarifa_empleado` (
  `id_empleado` int(11) NOT NULL,
  `tarifa_por_hora` decimal(10,2) NOT NULL,
  `id_tarifa_empleado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_transaccion`
--

CREATE TABLE `tipo_transaccion` (
  `id_tipo_transaccion_pk` int(11) NOT NULL,
  `nombre_tipo` varchar(100) NOT NULL,
  `codigo_tipo_transaccion` varchar(40) NOT NULL,
  `tipo_cuenta` enum('ACTIVO','PASIVO','CAPITAL','INGRESO','GASTO') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_transaccion`
--

INSERT INTO `tipo_transaccion` (`id_tipo_transaccion_pk`, `nombre_tipo`, `codigo_tipo_transaccion`, `tipo_cuenta`) VALUES
(2, 'Efectivo en caja', '1.1.10.10', 'ACTIVO'),
(3, 'Efectivo en bancos', '1.1.10.20', 'ACTIVO'),
(4, 'Inversiones negociables', '1.1.10.30', 'ACTIVO'),
(5, 'Mercancías', '1.1.30.10', 'ACTIVO'),
(6, 'Materia prima', '1.1.30.20', 'ACTIVO'),
(7, 'Materiales e insumos', '1.1.30.21', 'ACTIVO'),
(8, 'Subproductos, residuos y recuperados', '1.1.30.24', 'ACTIVO'),
(9, 'Impuesto al valor agregado', '1.1.40.20', 'ACTIVO'),
(10, 'Seguros pagados por anticipado', '1.1.50.20', 'ACTIVO'),
(11, 'Arrendamientos pagados por anticipado', '1.1.50.30', 'ACTIVO'),
(12, 'Maquinarias y equipos', '1.2.71.30', 'ACTIVO'),
(13, 'Equipos de transporte', '1.2.71.40', 'ACTIVO'),
(14, 'Equipos de computación', '1.2.71.50', 'ACTIVO'),
(15, 'Mobiliario y equipos de oficina', '1.2.71.60', 'ACTIVO'),
(16, 'Sobregiros', '2.1.10.10', 'PASIVO'),
(17, 'Pagarés', '2.1.10.20', 'PASIVO'),
(18, 'Cuentas por pagar', '2.1.20.20', 'PASIVO'),
(19, 'Impuesto al valor agregado', '2.1.40.20', 'PASIVO'),
(20, 'Capital social en acciones', '3.1.10.10', 'CAPITAL'),
(21, 'Resultados del período', '3.2.20.20', 'CAPITAL'),
(22, 'Venta de mercancía', '4.1.10.10', 'INGRESO'),
(23, 'Servicios profesionales', '4.1.20.10', 'INGRESO'),
(24, 'Variación de inventario', '5.2.20', 'INGRESO'),
(25, 'Compras', '5.2.30', 'GASTO'),
(26, 'Personal de ventas', '6.1.20.10', 'GASTO'),
(27, 'Bienes y suministros', '6.1.20.20', 'GASTO'),
(28, 'Servicios NO profesionales', '6.1.20.30', 'GASTO'),
(29, 'Servicios profesionales', '6.1.20.31', 'GASTO'),
(30, 'Depreciación', '6.1.20.60', 'GASTO'),
(31, 'Personal administrativo', '6.1.30.10', 'GASTO'),
(32, 'Bienes y suministros administrativos', '6.1.30.20', 'GASTO'),
(33, 'Servicios NO profesionales administrativos', '6.1.30.30', 'GASTO'),
(34, 'Servicios profesionales administrativos', '6.1.30.31', 'GASTO'),
(35, 'Depreciación administrativa', '6.1.30.60', 'GASTO'),
(36, 'Gastos por intereses', '6.2.10.10', 'GASTO'),
(37, 'Cuentas por Cobrar a Clientes', '1.1.20.10', 'ACTIVO'),
(38, 'Efectos por Cobrar', '1.1.20.20', 'ACTIVO'),
(39, 'Deudores Diversos', '1.1.20.30', 'ACTIVO'),
(40, 'Cuentas por Pagar a Proveedores', '2.1.20.10', 'PASIVO'),
(41, 'Letras por Pagar', '2.1.20.30', 'PASIVO'),
(42, 'Acreedores Diversos', '2.1.20.40', 'PASIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transacciones`
--

CREATE TABLE `transacciones` (
  `id_transaccion` int(11) NOT NULL,
  `id_tipo_transaccion_fk` int(45) NOT NULL,
  `fecha_asiento` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `transacciones`
--

INSERT INTO `transacciones` (`id_transaccion`, `id_tipo_transaccion_fk`, `fecha_asiento`) VALUES
(53, 20, '2025-09-01'),
(54, 20, '2025-12-08'),
(55, 22, '2025-12-08'),
(56, 29, '2025-12-08'),
(57, 22, '2025-12-08'),
(58, 3, '2025-12-08'),
(59, 18, '2025-12-08'),
(60, 37, '2025-12-08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculo`
--

CREATE TABLE `vehiculo` (
  `matricula` varchar(15) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `marca` varchar(20) DEFAULT NULL,
  `modelo` varchar(45) DEFAULT NULL,
  `afio` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  ADD PRIMARY KEY (`id_cate_gasto`),
  ADD KEY `idx_id_cate_gasto` (`id_cate_gasto`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `cedula_unique` (`cedula`);

--
-- Indices de la tabla `compra_repuesto`
--
ALTER TABLE `compra_repuesto`
  ADD PRIMARY KEY (`id_compra_repuesto`),
  ADD UNIQUE KEY `precio_unitario_compra` (`precio_unitario_compra`),
  ADD UNIQUE KEY `precio_unitario_compra_2` (`precio_unitario_compra`),
  ADD UNIQUE KEY `precio_unitario_compra_3` (`precio_unitario_compra`),
  ADD UNIQUE KEY `precio_unitario_compra_4` (`precio_unitario_compra`),
  ADD UNIQUE KEY `precio_unitario_compra_5` (`precio_unitario_compra`),
  ADD UNIQUE KEY `precio_unitario_compra_6` (`precio_unitario_compra`),
  ADD UNIQUE KEY `precio_unitario_compra_7` (`precio_unitario_compra`),
  ADD UNIQUE KEY `precio_unitario_compra_8` (`precio_unitario_compra`),
  ADD KEY `fk_proveedor` (`id_proveedor`),
  ADD KEY `fk_repuesto` (`id_repuesto`);

--
-- Indices de la tabla `concepto_cobro`
--
ALTER TABLE `concepto_cobro`
  ADD PRIMARY KEY (`id_concepto_cuenta_por_cobrar`),
  ADD KEY `fk_factura` (`id_factura`);

--
-- Indices de la tabla `concepto_pago`
--
ALTER TABLE `concepto_pago`
  ADD PRIMARY KEY (`id_concepto_cuenta_por_pagar`),
  ADD KEY `fk_compra_repuesto` (`id_compra_repuesto`);

--
-- Indices de la tabla `detalles_servicio`
--
ALTER TABLE `detalles_servicio`
  ADD PRIMARY KEY (`id_order`,`id_servicio`),
  ADD KEY `id_servicio` (`id_servicio`);

--
-- Indices de la tabla `detalle_repuesto`
--
ALTER TABLE `detalle_repuesto`
  ADD PRIMARY KEY (`id_order`,`id_repuesto`),
  ADD KEY `id_repuesto` (`id_repuesto`);

--
-- Indices de la tabla `detalle_transaccion`
--
ALTER TABLE `detalle_transaccion`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_transacciones` (`id_transaccion`),
  ADD KEY `tipo_transaccion_fk` (`id_tipo_transaccion_fk`);

--
-- Indices de la tabla `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD PRIMARY KEY (`num_diagnostico`),
  ADD KEY `idx_id_vehiculo` (`id_vehiculo`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD KEY `idx_id_cliente` (`id_cliente`),
  ADD KEY `idx_id_order` (`id_order`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id_gasto`),
  ADD KEY `idx_id_cate_gasto` (`id_cate_gasto`);

--
-- Indices de la tabla `itemfacturas`
--
ALTER TABLE `itemfacturas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `orden_de_trabajo`
--
ALTER TABLE `orden_de_trabajo`
  ADD PRIMARY KEY (`id_order`),
  ADD KEY `idx_num_diagnostico` (`num_diagnostico`);

--
-- Indices de la tabla `pago_realizado`
--
ALTER TABLE `pago_realizado`
  ADD PRIMARY KEY (`id_pago_realizado`),
  ADD KEY `idx_id_empleado` (`id_empleado`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `nombre_fiscal` (`nombre_fiscal`),
  ADD UNIQUE KEY `rif_juridico` (`rif_juridico`),
  ADD UNIQUE KEY `nombre_fiscal_2` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_3` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_4` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_5` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_6` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_7` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_8` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_9` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_10` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_11` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_12` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_13` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_14` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_15` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_16` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_17` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_18` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_19` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_20` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_21` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_22` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_23` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_24` (`nombre_fiscal`);

--
-- Indices de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  ADD PRIMARY KEY (`id_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_2` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_3` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_4` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_5` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_6` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_7` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_8` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_9` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_10` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_11` (`nombre_repuesto`),
  ADD KEY `idx_id_repuesto` (`id_repuesto`);

--
-- Indices de la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD PRIMARY KEY (`id_servicio`),
  ADD KEY `idx_id_servicio` (`id_servicio`);

--
-- Indices de la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD UNIQUE KEY `id_tarifa_empleado` (`id_tarifa_empleado`);

--
-- Indices de la tabla `tipo_transaccion`
--
ALTER TABLE `tipo_transaccion`
  ADD PRIMARY KEY (`id_tipo_transaccion_pk`);

--
-- Indices de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD PRIMARY KEY (`id_transaccion`),
  ADD KEY `id_tipo_transaccion_fk` (`id_tipo_transaccion_fk`);

--
-- Indices de la tabla `vehiculo`
--
ALTER TABLE `vehiculo`
  ADD PRIMARY KEY (`matricula`),
  ADD KEY `idx_id_cliente` (`id_cliente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `compra_repuesto`
--
ALTER TABLE `compra_repuesto`
  MODIFY `id_compra_repuesto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_transaccion`
--
ALTER TABLE `detalle_transaccion`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `itemfacturas`
--
ALTER TABLE `itemfacturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_de_trabajo`
--
ALTER TABLE `orden_de_trabajo`
  MODIFY `id_order` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago_realizado`
--
ALTER TABLE `pago_realizado`
  MODIFY `id_pago_realizado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicio`
--
ALTER TABLE `servicio`
  MODIFY `id_servicio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  MODIFY `id_tarifa_empleado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_transaccion`
--
ALTER TABLE `tipo_transaccion`
  MODIFY `id_tipo_transaccion_pk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  MODIFY `id_transaccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `compra_repuesto`
--
ALTER TABLE `compra_repuesto`
  ADD CONSTRAINT `fk_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  ADD CONSTRAINT `fk_repuesto` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`);

--
-- Filtros para la tabla `concepto_cobro`
--
ALTER TABLE `concepto_cobro`
  ADD CONSTRAINT `fk_factura` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`);

--
-- Filtros para la tabla `concepto_pago`
--
ALTER TABLE `concepto_pago`
  ADD CONSTRAINT `fk_compra_repuesto` FOREIGN KEY (`id_compra_repuesto`) REFERENCES `compra_repuesto` (`id_compra_repuesto`);

--
-- Filtros para la tabla `detalles_servicio`
--
ALTER TABLE `detalles_servicio`
  ADD CONSTRAINT `detalles_servicio_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orden_de_trabajo` (`id_order`),
  ADD CONSTRAINT `detalles_servicio_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id_servicio`);

--
-- Filtros para la tabla `detalle_repuesto`
--
ALTER TABLE `detalle_repuesto`
  ADD CONSTRAINT `detalle_repuesto_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orden_de_trabajo` (`id_order`),
  ADD CONSTRAINT `detalle_repuesto_ibfk_2` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`);

--
-- Filtros para la tabla `detalle_transaccion`
--
ALTER TABLE `detalle_transaccion`
  ADD CONSTRAINT `detalle_transaccion_ibfk_1` FOREIGN KEY (`id_transaccion`) REFERENCES `transacciones` (`id_transaccion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `detalle_transaccion_ibfk_2` FOREIGN KEY (`id_tipo_transaccion_fk`) REFERENCES `tipo_transaccion` (`id_tipo_transaccion_pk`);

--
-- Filtros para la tabla `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD CONSTRAINT `diagnostico_ibfk_1` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`matricula`);

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`id_order`) REFERENCES `orden_de_trabajo` (`id_order`);

--
-- Filtros para la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD CONSTRAINT `gasto_ibfk_1` FOREIGN KEY (`id_cate_gasto`) REFERENCES `categoria_gasto` (`id_cate_gasto`);

--
-- Filtros para la tabla `orden_de_trabajo`
--
ALTER TABLE `orden_de_trabajo`
  ADD CONSTRAINT `orden_de_trabajo_ibfk_1` FOREIGN KEY (`num_diagnostico`) REFERENCES `diagnostico` (`num_diagnostico`);

--
-- Filtros para la tabla `pago_realizado`
--
ALTER TABLE `pago_realizado`
  ADD CONSTRAINT `pago_realizado_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);

--
-- Filtros para la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  ADD CONSTRAINT `tarifa_empleado_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);

--
-- Filtros para la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD CONSTRAINT `transacciones_ibfk_1` FOREIGN KEY (`id_tipo_transaccion_fk`) REFERENCES `tipo_transaccion` (`id_tipo_transaccion_pk`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `vehiculo`
--
ALTER TABLE `vehiculo`
  ADD CONSTRAINT `vehiculo_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
