import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SafeScreen = ({ children }) => {
  const inserts = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: inserts.top
      }}
    >
      {children}
    </View>
  );
};

export default SafeScreen;
