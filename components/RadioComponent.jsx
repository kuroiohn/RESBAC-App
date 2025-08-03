import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, useColorScheme} from 'react-native';
import { Colors } from '../constants/Colors';
import TitleText from '../components/TitleText';

const RadioGroup = ({ label, options, selectedValue, onValueChange }) => {
    return (
        <View style={styles.container}>
            {/* Using the TitleText component for the label */}
            <TitleText type="title3" style={styles.label}>{label}</TitleText>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={styles.optionContainer}
                    onPress={() => onValueChange(option.value)}
                >
                    <View style={styles.radioCircle}>
                        {/* The inner circle is rendered only when an option is selected */}
                        {selectedValue === option.value && <View style={styles.selectedRadioCircle} />}
                    </View>
                    <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '80%',
        alignSelf: 'center',

    },
    // The label style is now simplified because TitleText handles font size and color
    label: {
        marginBottom: 10,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        borderColor: '#ccc',
    },
    radioCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedRadioCircle: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#1279D7',
    },
    optionText: {
        marginLeft: 10,
        fontSize: 14,
    },
});

export default RadioGroup;