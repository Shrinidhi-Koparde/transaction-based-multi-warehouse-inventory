# Transaction-Based Multi-Warehouse Inventory Management and Stock Redistribution System

A transaction-safe multi-warehouse inventory management and stock redistribution system designed to detect inventory shortages, identify suitable source warehouses, recommend safe stock transfers, and maintain inventory consistency throughout the transfer lifecycle.

---

## Project Overview

In a multi-warehouse quick-commerce network, a product may become unavailable at one warehouse even when sufficient inventory exists at another warehouse.

This project addresses this inventory imbalance by providing an automated decision and workflow system that:

- Monitors inventory levels across multiple warehouses
- Analyses demand and inventory risk
- Detects low and critical stock conditions
- Calculates Days of Inventory (DOI)
- Analyses demand trends using moving averages
- Identifies eligible source warehouses
- Ranks source warehouses using a weighted scoring mechanism
- Uses Dijkstra's algorithm for shortest operational route determination
- Calculates safe transfer quantities
- Supports multi-source and partial fulfillment
- Handles transaction-safe inventory reservation
- Prevents over-allocation during concurrent requests
- Assigns logistics employees
- Tracks transfer status
- Reconciles received inventory
- Maintains transaction history and audit logs
- Supports Mother/Regional Warehouse replenishment when local inventory is insufficient

The system is designed as a reference implementation of an intelligent internal stock redistribution workflow and does not claim to replicate any proprietary production system.

---

# Current Stage

## Stage S1 – Requirements Engineering

### Status

S0 – Problem Definition & Need Identification: *Completed*

S1 – Requirements Engineering: *Completed*

Gate 0: *Completed*

The project has completed the problem-definition and requirements-engineering stages. The next phase focuses on system design and implementation.

---

# Project Focus

The project focuses on:

1. Multi-warehouse inventory monitoring
2. Demand and inventory risk detection
3. Intelligent source warehouse selection
4. Route optimization
5. Safe stock redistribution
6. Transaction consistency
7. Concurrent inventory request handling
8. Transfer workflow management
9. Inventory reconciliation
10. Auditability and traceability

