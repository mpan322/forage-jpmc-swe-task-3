# Thought Process
Initially I went through the step by step guide trying to reproduce the graph described to see how one might modify the code. I thought that the idea of tracking correlations was interesting but thought the existing approach could be improved. 

## Design of Graph
Primarily, I felt that the usage of fixed bounds for triggering the alert had many flaws.
One clear problem is that it assumes the ratio of the stock to approximately be one, otherwise the bounds would be meaningless. Hence, if two companies are correlated but have stocks with vastly different values, this visual would not be helpful. For example, one might expect this from Intel and Nvidia. This limits the ease of reusability of the graph. Additionally, fixed bounds do not account for long term changes in the scale of the ratio. For example, if one company was growing faster than another one would expect that the ratio of their stock price to change in the long run. If this is not accounted for, traders may invest assuming a regression to a previous trend which never comes to pass.

Also, there is no easy indicator of a long term breakdown in the correlation. This may occur if one company makes a significant pivot. If not caught quickly, traders may make trades based on the graph which may have become essentially meaningless.

## My Solution
To fix the issues with the bounds above I decided to make use of Bollinger Bands for the ratio.
These incorporate the behavior of the stocks over the recent period, the past 20 days in the current implementation. 

This approach fixes many issues described above. Bollinger Bands vary with the moving average and current, so they can work for any scale of ratio, not just those which are approximately one. This also allows for automatic adjustment to long term changes in the scale of the ratio. Furthermore, if the bands begin to remain wide for a long period, this could indicate consistent volatility in the ratio, and hence a possible long term break down in the correlation.

In addition, there are further benefits. As mentioned, the width of the bands can be indicators of volatility in the ratio. Hence, when the bands begin to widen it provides a clear visual indicator to traders that a trading opportunity could be approaching.

## Implementation Approach
When implementing the above visualization, I attempted to keep the code readable as well as flexible to changes. For example a separate class was made for managing the sliding window based calculations. By abstracting this implementation to a separate class, it promotes readability through a separation of concerns. In addition, the class was also designed to easily allow the window duration to be modified, as it is something that would likely need to be tuned.



# Insights Traders Can Gain
The display created shows a graph of the ratio between two correlated stocks, in this case ABC and DEF, plotted over time. By plotting this ratio over time it allows traders to see when the correlation temporarily weakens, providing a trading opportunity. For example if the ratio suddenly is lower than normal it may indicate stock ABC is undervalued and DEF is overvalued. This is because compared to the value of DEF, ABC's value is lower than expected. This could indicate to a trader that they should sell DEF and purchase ABC, as it is likely that the ratio will regress to its normal value. Conversely if the ratio is higher than normal it could indicate DEF is undervalued and ABC is overvalued, and hence potentially DEF should be bought and ABC should be sold.

Additionally, the displayed graph includes Bollinger Bands. These can help traders by indicating what deviation is typical, being within the bounds, and abnormal, breaching the bounds of the bands. This is valuable as not all deviations from normal behavior is actually significant enough that it should be acted upon, and the provided historical information for these particular stocks can be a good indicator of significance. Also, this provides a clear visual indicator of important information contained in this graph, whether the correlation is suddenly weakening.
Furthermore, as mentioned above, the bands can also indicate a long term breakdown of the correlation with long term volatility in the ratio.

Finally, the plot also includes a trigger which activates when the bounds of the plot are crossed. This is a helpful visual indicator to traders, allowing the important events to stand out from the background noise.
