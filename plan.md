We're going to create a visualization for shapley value estimation using monte carlo simulation.

Let's start by making a tetris viz.
Make a tetris board, filled mostly with pieces. We can generate it randomly, but it shouldn't be too sparse.

Then we will do the simulation. Randomly order the pieces. Pull them out. If the height of the level changes, blame that on the piece.
Do that several times and then accumulate the blame on the pieces.
Do this probably in javascript for the viz. Make there be a random seed so we can recover a specific vizualisation if we want. 
Let's show the simulation on the LHS, and the blame accumulating on the RHS side. 