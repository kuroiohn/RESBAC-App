import { TextInput, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

const ThemedTextInput = ({ style, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <TextInput
      style={[
        {
          backgroundColor: "#f5f5f5",
          color: "#625f72",
          padding: 20,
          borderRadius: 5,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedTextInput;
