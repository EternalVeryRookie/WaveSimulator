# WaveSimulator

## 概要
波の運動をリアルタイムシミュレーションするプログラムです。

## 詳細
### 波動方程式
波動方程式と呼ばれる以下の2階偏微分方程式の解を数値計算でリアルタイムに求め、結果を可視化するプログラムです。
![\begin{align*}
\frac{\partial^2 f}{\partial^2 t} = c(\frac{\partial^2 f}{\partial^2 x} + \frac{\partial^2 f}{\partial^2 y})\ \ \ \ \ \ \ \ \ (x_0 \leq x \leq x_1)\ \ \ \ \ \ \ (y_0 \leq y \leq y_1)
\end{align*}
](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cbegin%7Balign%2A%7D%0A%5Cfrac%7B%5Cpartial%5E2+f%7D%7B%5Cpartial%5E2+t%7D+%3D+c%28%5Cfrac%7B%5Cpartial%5E2+f%7D%7B%5Cpartial%5E2+x%7D+%2B+%5Cfrac%7B%5Cpartial%5E2+f%7D%7B%5Cpartial%5E2+y%7D%29%5C+%5C+%5C+%5C+%5C+%5C+%5C+%5C+%5C+%28x_0+%5Cleq+x+%5Cleq+x_1%29%5C+%5C+%5C+%5C+%5C+%5C+%5C+%28y_0+%5Cleq+y+%5Cleq+y_1%29%0A%5Cend%7Balign%2A%7D%0A)

![\begin{align*}
\f(x, y, 0) = \psi(x, y)
\end{align*}
](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cbegin%7Balign%2A%7D%0A%5Cf%28x%2C+y%2C+0%29+%3D+%5Cpsi%28x%2C+y%29%0A%5Cend%7Balign%2A%7D%0A)

![\begin{align*}
\frac{\partial f}{\partial t}(x, y, 0) = \phi(x, y)
\end{align*}
](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cbegin%7Balign%2A%7D%0A%5Cfrac%7B%5Cpartial+f%7D%7B%5Cpartial+t%7D%28x%2C+y%2C+0%29+%3D+%5Cphi%28x%2C+y%29%0A%5Cend%7Balign%2A%7D%0A)

![\begin{align*}
f(x, y, t) = \rho(x, y, t)\ \ \ \ \ \ (x, y) \in \partial\Omega
\end{align*}
](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cbegin%7Balign%2A%7D%0Af%28x%2C+y%2C+t%29+%3D+%5Crho%28x%2C+y%2C+t%29%5C+%5C+%5C+%5C+%5C+%5C+%28x%2C+y%29+%5Cin+%5Cpartial%5COmega%0A%5Cend%7Balign%2A%7D%0A)



ここで、fはx, y, tの3変数関数であり、時刻tにおける位置（x, y）上の波の高さを表現します。また、![\partial\Omega](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cpartial%5COmega)は定義域の境界を表します。


### UI
