-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-11-2025 a las 23:42:00
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
  `nombre_cate` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `apellido` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `correo` varchar(50) DEFAULT NULL,
  `direccion` varchar(45) DEFAULT NULL,
  `telefono` varchar(12) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`cedula`, `nombre`, `apellido`, `id_cliente`, `correo`, `direccion`, `telefono`) VALUES
('10636307', 'Maria', 'Romero', 3, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('106363010', 'Maria', 'Romerotee', 4, 'mariamilagro@gmail.coms', 'La Miel', '0424528464'),
('10446307', 'Maria', 'Romero', 6, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('10444407', 'Maria', 'Romero', 7, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('10475865', 'Maria', 'Romera', 9, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('104745565', 'Maria', 'Romera', 10, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('147522565', 'Maria', 'Romera', 11, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('14733565', 'Maria', 'Romera', 12, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('15866565', 'Maria', 'Romera', 13, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('21586987', 'Jose', 'Perez', 16, 'josesitoperez@gmail.com', 'La Miel', '04160196364');

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
  `cantidad_usada` int(11) DEFAULT NULL,
  `precio_unitario_cobrado` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diagnostico`
--

CREATE TABLE `diagnostico` (
  `num_diagnostico` int(11) NOT NULL,
  `id_vehiculo` varchar(15) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `descrip_falla` tinytext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `id_empleado` int(11) NOT NULL,
  `usuario` varchar(30) DEFAULT NULL,
  `contraseña` varchar(45) DEFAULT NULL,
  `nombre_emp` varchar(45) DEFAULT NULL,
  `apellido_emp` varchar(45) DEFAULT NULL,
  `cargo` varchar(45) DEFAULT NULL,
  `fecha_contratacion` date DEFAULT NULL,
  `sueldo_base` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL,
  `fecha_fact` date DEFAULT NULL,
  `estado_pago` varchar(20) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_order` int(11) DEFAULT NULL,
  `metodo_pago` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gasto`
--

CREATE TABLE `gasto` (
  `id_gasto` int(11) NOT NULL,
  `fecha_gasto` date DEFAULT NULL,
  `monto_gasto` decimal(10,2) DEFAULT NULL,
  `descp_gasto` tinytext DEFAULT NULL,
  `tipo_gasto` varchar(45) DEFAULT NULL,
  `id_cate_gasto` int(11) DEFAULT NULL,
  `metodo_pago` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_de_trabajo`
--

CREATE TABLE `orden_de_trabajo` (
  `id_order` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_estimada` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `num_diagnostico` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago_realizado`
--

CREATE TABLE `pago_realizado` (
  `id_pago_realizado` int(11) NOT NULL,
  `fecha_pago` date DEFAULT NULL,
  `monto_pagado` decimal(10,2) DEFAULT NULL,
  `concepto_pago` varchar(45) DEFAULT NULL,
  `id_empleado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuesto`
--

CREATE TABLE `repuesto` (
  `id_repuesto` int(11) NOT NULL,
  `nombre_repuesto` varchar(45) DEFAULT NULL,
  `descp_repuesto` tinytext DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `stock_inventario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `id_servicio` int(11) NOT NULL,
  `nombre_servicio` varchar(45) DEFAULT NULL,
  `description` tinytext DEFAULT NULL,
  `precio_base` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifa_empleado`
--

CREATE TABLE `tarifa_empleado` (
  `id_empleado` int(11) NOT NULL,
  `tarifa_por_hora` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculo`
--

CREATE TABLE `vehiculo` (
  `matricula` varchar(15) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `año` year(4) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `marca` varchar(20) DEFAULT NULL,
  `modelo` varchar(45) DEFAULT NULL
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
-- Indices de la tabla `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD PRIMARY KEY (`num_diagnostico`),
  ADD KEY `idx_id_vehiculo` (`id_vehiculo`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD KEY `idx_id_empleado` (`id_empleado`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD KEY `idx_id_cliente` (`id_cliente`),
  ADD KEY `idx_id_order` (`id_order`);

--
-- Indices de la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id_gasto`),
  ADD KEY `idx_id_cate_gasto` (`id_cate_gasto`);

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
-- Indices de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  ADD PRIMARY KEY (`id_repuesto`),
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
  ADD PRIMARY KEY (`id_empleado`);

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
-- Restricciones para tablas volcadas
--

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
-- Filtros para la tabla `vehiculo`
--
ALTER TABLE `vehiculo`
  ADD CONSTRAINT `vehiculo_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
