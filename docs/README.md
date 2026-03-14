# Docs — Coldev-CADC

Este directorio concentra la documentación base del producto antes de seguir implementando.

## Objetivo

Documentar:

- lo que **necesitamos**
- lo que **haremos**
- lo que **queremos construir**
- lo que hoy existe en el **frontend de referencia**
- la base inicial de **arquitectura**
- el modelo conceptual de **base de datos**
- la organización objetivo del **frontend y flujo de usuario**
- el **roadmap de SDDs** para construir ordenado

## Estructura

- `vision-producto.md` — visión, alcance, necesidades y prioridades
- `requisitos-funcionales/requisitos-funcionales-borrador.md` — borrador funcional inicial
- `analisis/frontend-referencia.md` — análisis del frontend actual como fuente de referencia
- `arquitectura/arquitectura-inicial.md` — arquitectura objetivo, responsabilidades y patrón de diseño
- `arquitectura/backend-apps-modelos-propuestos.md` — propuesta de estructura definitiva de apps y modelos Django
- `arquitectura/frontend-shell-flujo-usuario.md` — refactor propuesto del frontend con app shell, sidebar, secciones y tarjetas funcionales
- `arquitectura/roadmap-sdds-frontend.md` — separación recomendada en cambios SDD para construir el frontend de forma ordenada
- `base-datos/modelo-conceptual-inicial.md` — entidades, relaciones y ERD inicial

## Estado actual

Esta documentación es una base de trabajo construida a partir de:

- `AGENTS.md`
- artefactos SDD del cambio `fundacion-producto-cdc`
- análisis del frontend actual de `referenciamar2`
- referencia documental de proceso usada de forma **anonimizada**

## Próximo paso

Esta carpeta debe seguir consolidándose para:

1. cerrar requisitos funcionales reales
2. ajustar arquitectura backend y frontend
3. ajustar el modelo de datos
4. ordenar el flujo de usuario y la navegación modular
5. dividir la construcción en SDDs pequeños y coherentes
6. alinear la implementación a la visión de producto real
