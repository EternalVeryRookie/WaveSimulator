# WaveSimulator
WebGL2.0 ComputeShaderの機能が各種ブラウザから削除されたためこのプログラムは動作しなくなりました。

## 概要
波の運動をリアルタイムシミュレーションするプログラムです。

## 試してみる
[firebase hostingを利用して公開しています](https://wavesimulator-eba8a.web.app/)

## 詳細
### 波動方程式
波動方程式と呼ばれる以下の2階偏微分方程式の解を数値計算でリアルタイムに求め、結果を可視化するプログラムです。

![\begin{align*}
\frac{\partial^2 f}{\partial^2 t} = c(\frac{\partial^2 f}{\partial^2 x} + \frac{\partial^2 f}{\partial^2 y})\ \ \ \ \ \ \ \ \ (x_0 \leq x \leq x_1)\ \ \ \ \ \ \ (y_0 \leq y \leq y_1)
\end{align*}
](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cbegin%7Balign%2A%7D%0A%5Cfrac%7B%5Cpartial%5E2+f%7D%7B%5Cpartial%5E2+t%7D+%3D+c%28%5Cfrac%7B%5Cpartial%5E2+f%7D%7B%5Cpartial%5E2+x%7D+%2B+%5Cfrac%7B%5Cpartial%5E2+f%7D%7B%5Cpartial%5E2+y%7D%29%5C+%5C+%5C+%5C+%5C+%5C+%5C+%5C+%5C+%28x_0+%5Cleq+x+%5Cleq+x_1%29%5C+%5C+%5C+%5C+%5C+%5C+%5C+%28y_0+%5Cleq+y+%5Cleq+y_1%29%0A%5Cend%7Balign%2A%7D%0A) <br>
![\begin{align*}
\f(x, y, 0) = \psi(x, y)
\end{align*}
](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cbegin%7Balign%2A%7D%0A%5Cf%28x%2C+y%2C+0%29+%3D+%5Cpsi%28x%2C+y%29%0A%5Cend%7Balign%2A%7D%0A) <br>
![\begin{align*}
\frac{\partial f}{\partial t}(x, y, 0) = \phi(x, y)
\end{align*}
](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cbegin%7Balign%2A%7D%0A%5Cfrac%7B%5Cpartial+f%7D%7B%5Cpartial+t%7D%28x%2C+y%2C+0%29+%3D+%5Cphi%28x%2C+y%29%0A%5Cend%7Balign%2A%7D%0A) <br>
![\begin{align*}
f(x, y, t) = \rho(x, y, 0)\ \ \ \ \ \ (x, y) \in \partial\Omega
\end{align*}
](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cbegin%7Balign%2A%7D%0Af%28x%2C+y%2C+t%29+%3D+%5Crho%28x%2C+y%2C+0%29%5C+%5C+%5C+%5C+%5C+%5C+%28x%2C+y%29+%5Cin+%5Cpartial%5COmega%0A%5Cend%7Balign%2A%7D%0A)



ここで、fはx, y, tの3変数関数であり、時刻tにおける位置（x, y）上の波の高さを表現します。また、![\partial\Omega](https://render.githubusercontent.com/render/math?math=%5Cdisplaystyle+%5Cpartial%5COmega)は定義域の境界を表します。
また、プログラムでは境界上での波の高さを時間によらず一定としています。


### UI
![UI](https://user-images.githubusercontent.com/53905926/96358052-fec60680-113d-11eb-8fd2-76efc3b41cc4.png)
プログラムでは、初期条件を混合ガウス関数で表現します。ユーザーは、混合ガウス関数のパラメーターを操作することで初期条件を好きな形に編集できます。
ただし、パラメーターの数が多くなると操作が難しくなるため、プログラムでは混合ガウス関数の各ガウス関数に等方性を仮定しています。
また、時間分解能dt、空間分解能dx dy、波の速さを表すパラメーターcも編集することができます。

## 動作環境
プログラムでは、波動方程式の数値計算にWebGL2.0のコンピュートシェーダー機能を利用しています。この機能を動作させるためにはブラウザの拡張機能を有効化する必要があります（2020年10月18日時点）。
ブラウザの設定画面からWebGL Draft Extensionsを有効化してください。

## 開発環境
### 言語
HTML 5 <br>
CSS <br>
javascript <br>

### ライブラリ
three.js r121<br>
react.js 16.13.1  <br>
※主要なもののみ記載。詳細は[こちら](https://github.com/EternalVeryRookie/WaveSimulator/blob/master/package.json)

### ビルドツール
webpack 4.43.0
