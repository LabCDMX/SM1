import tensorflow as tf
import numpy as np
from collections import deque


# Implements the network for Q learning. 
# Mostly taken from https://github.com/udacity/deep-learning/blob/master/reinforcement/Q-learning-cart.ipynb
class QNetwork:
    def __init__(self, learning_rate=0.01, state_size=7, action_size=4, hidden_size=20, name='QNetwork'):
        # state inputs to the Q-network
        with tf.variable_scope(name):
            self.inputs_ = tf.placeholder(tf.float32, [None, state_size], name='inputs')
            
            # One hot encode the actions to later choose the Q-value for the action
            self.actions_ = tf.placeholder(tf.int32, [None], name='actions')
            one_hot_actions = tf.one_hot(self.actions_, action_size)
            
            # Target Q values for training
            self.targetQs_ = tf.placeholder(tf.float32, [None], name='target')
            
            # ReLU hidden layers
            init = tf.truncated_normal_initializer(stddev=0.02)
            self.fc1 = tf.contrib.layers.fully_connected(self.inputs_, hidden_size, 
                                                         weights_initializer=tf.truncated_normal_initializer(stddev=0.02), scope="fc1")
            self.fc2 = tf.contrib.layers.fully_connected(self.fc1, hidden_size, 
                                                         weights_initializer=tf.truncated_normal_initializer(stddev=0.02), scope="fc2")
            # Linear output layer
            self.output = tf.contrib.layers.fully_connected(self.fc2, action_size, 
                                                            activation_fn=None, scope="output")
            
            # Q estimates
            self.Q = tf.reduce_sum(tf.multiply(self.output, one_hot_actions), axis=1)
            
            # Gradient descent step
            self.loss = tf.reduce_mean(tf.square(self.targetQs_ - self.Q))
            self.opt = tf.train.AdamOptimizer(learning_rate).minimize(self.loss)


class Memory():
    def __init__(self, max_size = 1000):
        self.buffer = deque(maxlen=max_size)
    
    def add(self, experience):
        self.buffer.append(experience)
            
    def sample(self, batch_size):
        idx = np.random.choice(np.arange(len(self.buffer)), 
                               size=batch_size, 
                               replace=False)
        return [self.buffer[ii] for ii in idx]