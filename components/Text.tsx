import { type StyleProp, Text, type TextStyle } from "react-native";

export const AppText = ({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: StyleProp<TextStyle>;
}) => {
	return (
		<Text style={[{ fontFamily: "Inter_900Black" }, style ?? {}]}>
			{children}
		</Text>
	);
};
