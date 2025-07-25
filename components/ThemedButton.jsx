import { Pressable, StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'

function ThemedButton({ style, children, ...props }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
      {...props}
    >
      {/* Wrap children in <Text> if it's a string */}
      {/* finally!! naayos ang error about <Text> */}
      {typeof children === 'string' ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 6,
    marginVertical: 10
  },
  pressed: {
    opacity: 0.5
  },
})

export default ThemedButton