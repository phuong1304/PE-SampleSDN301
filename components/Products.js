import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { baseURL } from "../constants/api";
import { TextInput } from "react-native-gesture-handler";
import FilterDropdown from "./FilterDropdown";
import { showErrorMessage, showSuccessMessage } from "../constants/noti";

const { width } = Dimensions.get("window");
const itemWidth = (width - 30) / 2; // Adjust based on your desired spacing

const Item = ({ item, isFavorite, saveToFavorites, removeFromFavorites }) => {
  const navigation = useNavigation();

  const ratings = item.feedbacks.map((feedback) => feedback.rating);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((total, rating) => total + rating) / ratings.length
      : 0;

  // Function to render stars based on average rating
  const renderRatingStars = (averageRating) => {
    const stars = [];
    const roundedRating = Math.round(averageRating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= roundedRating ? "star" : "star-outline"}
          size={20}
          color={i <= roundedRating ? "gold" : "black"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Detail", { product: item })}
      style={{
        width: itemWidth,
        margin: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "white",
      }}
    >
      <View style={{ alignItems: "center", backgroundColor: "white" }}>
        <Image
          style={{ width: "80%", height: itemWidth, alignSelf: "center" }}
          source={{ uri: item.image }}
        />
        <TouchableOpacity
          style={{ position: "absolute", top: 10, right: 10 }}
          onPress={() =>
            isFavorite ? removeFromFavorites(item.id) : saveToFavorites(item)
          }
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color="red"
          />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="star" size={16} color="gold" />
          <Text style={{ marginLeft: 5 }}>{averageRating.toFixed(1)}</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          {item.perfumeName}
        </Text>
        <Text style={{ fontSize: 14, color: "#666" }}>{item.company}</Text>
        <Text style={{ fontSize: 16, color: "green" }}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
};
const Perfumes = ({ navigation }) => {
  const [perfumes, setPerfumes] = useState([]);
  const [perfumesDisplay, setPerfumesDisplay] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [company, setCompany] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [showPriceList, setShowPriceList] = useState(false);
  const [titleName, setTitleName] = useState("All Perfumes");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    price: { min: null, max: null },
    rating: null,
  });
  const [sortBy, setSortBy] = useState(null);
  const [category, setCategory] = useState(null);

  const fetchPerfumes = async () => {
    return axios.get(baseURL + "/product");
  };

  const getFavorites = async () => {
    const value = await AsyncStorage.getItem("favorites");
    if (value !== null) {
      setFavorites(JSON.parse(value));
    }
  };

  const renderItem = ({ item }) => {
    const isFavorite = favorites.some(
      (favoriteItem) => favoriteItem.id === item.id
    );
    return (
      <Item
        item={item}
        isFavorite={isFavorite}
        saveToFavorites={saveToFavorites}
        removeFromFavorites={removeFromFavorites}
      />
    );
  };

  const saveToFavorites = async (item) => {
    try {
      const updatedFavorites = [...favorites, item];
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      showSuccessMessage("Item added to favorites!");
    } catch (error) {
      showErrorMessage("Failed to add item to favorites.");
    }
  };

  const removeFromFavorites = async (id) => {
    try {
      const updatedFavorites = favorites.filter((item) => item.id !== id);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      showSuccessMessage("Item removed from favorites!");
    } catch (error) {
      showErrorMessage("Failed to remove item from favorites.");
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredPerfumes = perfumes.filter((perfume) =>
      perfume.perfumeName.toLowerCase().includes(text.toLowerCase())
    );
    setPerfumesDisplay(filteredPerfumes);
  };

  useFocusEffect(
    useCallback(() => {
      getFavorites();

      fetchPerfumes().then((response) => {
        setTitleName("All Perfumes");
        setPerfumes(response.data);
        setPerfumesDisplay(response.data);
      });
    }, [])
  );

  const handleResetFilter = () => {
    setFilters({ price: { min: null, max: null }, rating: null });
    setCategory(null);
    setPerfumesDisplay(perfumes); // Reset display to show all perfumes
    setSortBy(null); // Reset sorting to none
  };

  const applyFiltersAndSorting = (newFilters, sortOption) => {
    let filteredPerfumes = perfumes;

    // Filter by price
    if (newFilters.price.min !== null || newFilters.price.max !== null) {
      filteredPerfumes = filteredPerfumes.filter((perfume) => {
        const withinMin =
          newFilters.price.min === null ||
          perfume.price >= newFilters.price.min;
        const withinMax =
          newFilters.price.max === null ||
          perfume.price <= newFilters.price.max;
        return withinMin && withinMax;
      });
    }

    // Filter by rating
    if (newFilters.rating !== null) {
      filteredPerfumes = filteredPerfumes.filter((perfume) => {
        const averageRating = perfume.feedbacks.length
          ? perfume.feedbacks.reduce(
              (sum, feedback) => sum + feedback.rating,
              0
            ) / perfume.feedbacks.length
          : 0;
        return averageRating >= newFilters.rating;
      });
    }

    // Filter by category
    if (category !== null) {
      filteredPerfumes = filteredPerfumes.filter((perfume) => {
        console.log("perfume.gender", perfume.gender);
        debugger;
        if (category === "male") return perfume.gender === true;
        if (category === "female") return perfume.gender === false;
        if (category === "both") return perfume.gender === null;
        return true;
      });
    }

    // Sort
    if (sortOption) {
      const isDescending = sortOption.startsWith("-");
      const sortKey = isDescending ? sortOption.substring(1) : sortOption;
      filteredPerfumes.sort((a, b) => {
        let aValue, bValue;

        if (sortKey === "price") {
          aValue = a.price;
          bValue = b.price;
        } else if (sortKey === "rating") {
          aValue = a.feedbacks.length
            ? a.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
              a.feedbacks.length
            : 0;
          bValue = b.feedbacks.length
            ? b.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
              b.feedbacks.length
            : 0;
        }

        return isDescending ? bValue - aValue : aValue - bValue;
      });
    }

    setPerfumesDisplay(filteredPerfumes);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFiltersAndSorting(newFilters, sortBy);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    applyFiltersAndSorting(filters, sortOption);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    applyFiltersAndSorting(filters, sortBy);
  };

  const renderCategoryButtons = () => {
    const categories = [
      { label: "All", value: null },
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Both", value: "both" },
    ];

    return (
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            onPress={() => handleCategoryChange(category.value)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: category.value === category ? "#000" : "#ddd",
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                color: category.value === category ? "#fff" : "#000",
              }}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {renderCategoryButtons()}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TextInput
          placeholder="Search perfumes..."
          value={searchText}
          onChangeText={handleSearch}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            padding: 10,
            flex: 1,
            marginRight: 10,
          }}
        />
        <FilterDropdown
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onResetFilter={handleResetFilter}
        />{" "}
      </View>
      {/* Add FilterDropdown here */}
      <FlatList
        data={perfumesDisplay}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </View>
  );
};

export default Perfumes;
