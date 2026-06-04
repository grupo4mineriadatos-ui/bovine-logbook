## Contexto
En el formulario "Cargar Tacto" (`src/routes/index.tsx`), el campo **"Días de gestación estimados"** es siempre visible y obligatorio, aunque el usuario seleccione **"Negativo"** en el campo **Resultado**. Un resultado negativo significa que no hay gestación, por lo que pedir días de gestación no tiene sentido.

## Cambio propuesto
1. Cuando `resultado === "negativo"`, ocultar el campo **"Días de gestación estimados"**.
2. Ajustar la validación del `onSubmit` para que no exija `dias` cuando el resultado sea "negativo".
3. Cuando se envíe un tacto negativo, enviar `dias_gestacion_estim` como `null` (o omitirlo) para que el backend no reciba un valor irrelevante.
4. Al cambiar de resultado a "negativo", limpiar el valor de `dias`.

## Archivo a modificar
- `src/routes/index.tsx`

## Detalles técnicos
- Usar renderizado condicional para mostrar/ocultar el `<Field>` de días.
- Actualizar la lógica de validación en `onSubmit`.
- Mantener el comportamiento actual para "positivo" y "dudoso" (donde sí se piden los días).