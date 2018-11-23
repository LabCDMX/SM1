# Modelos de Machine Learning

La solución utiliza dos modelos de machine learning para generar las predicciones de tiempos de viaje y recomendaciones de despacho. Una explicación de alto nivel de estos modelos puede ser encontrada en [liga](), a continuación detallamos cada uno

## Modelo Generativo

El modelo generativo es un modelo jerárquico bayesiano de la rapidez (magnitud de la velocidad) con la que los autobuses se mueven a lo largo de la ruta. Utiliza promedios calculados históricamente en cada tramo de la ruta entre dos paradas y el día de la semana, el estado de lluvia (llueve o no) y la rapidez medida en el minuto anterior para estimar una distribución de probabilidad para la rapidez en el minuto actual.

El modelo es lineal, con una verosimilitud Gamma para la rapidez actual, función liga identidad, y distribuciones a priori HalfCauchy para todos los parámetros, es decir:

$ \beta_0, \beta_1, \beta_2 \sim HalfCauchy(0, 2.5)$
$ \tau \sim HalfCauchy(0, 2.5)$
$ \mu = \beta_0 r + \beta_1 v_{t-1} + \beta_2 v_m $
$ v_t \sim Gamma(\mu, \tau)$

donde $v_t$ es la rapidez a predecir, $v_{t-1}$ es la rapidez en el minuto anterior, $v_m$ es el promedio histórico bajo las condiciones en las que se quiere predecir (tramo, día de la semana) y $r$ es el estado de la lluvia. Nótese que en este caso la verosimilitud Gamma está parametrizada en términos de su valor esperado $\mu$ y su precisión $\tau$

Para predecir los tiempos de viaje, estimamos el valor esperado de cada combinación de factores

## Agente de Aprendizaje por Refuerzo


