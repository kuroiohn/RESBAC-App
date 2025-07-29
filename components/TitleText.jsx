import { Text, StyleSheet } from 'react-native'

const TitleText = ({ type = 'title', style, children }) => {
  return <Text style={[styles[type], style]}>{children}</Text>
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 19,
  },
  title1: {
    color: '#161616',
    fontSize: 50,
    fontWeight: 'bold',
  },
  title2: {
    color: '#161616',
    fontSize: 27,
    fontWeight: '600',
  },
  title3: {
    color: '#919191',
    fontSize: 15,
  },
  title4: {
    color: '#161616',
    fontSize: 11,
    marginRight: 111,
  },
})

export default TitleText
