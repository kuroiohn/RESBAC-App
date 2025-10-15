import { TextInput } from "react-native";

const ThemedTextInput = ({ style, ...props }) => {
  return (
    <TextInput
      style={[
        {
          backgroundColor: "#f5f5f5",
          color: "#625f72", // text color
          padding: 20,
          borderRadius: 5,
        },
        style,
      ]}
      placeholderTextColor='#625f72' // 👈 important for Android
      {...props}
    />
  );
};

export default ThemedTextInput;
