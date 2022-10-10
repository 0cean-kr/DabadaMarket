import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ChattingListScreen from './ChattingListScreen';

const Stack = createNativeStackNavigator();

function AppStackChatting() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChattingListScreen"
        component={ChattingListScreen}
        options={{
          title: 'ChattingListScreen List',
        }}
      />
    </Stack.Navigator>
  );
}

export default AppStackChatting;
