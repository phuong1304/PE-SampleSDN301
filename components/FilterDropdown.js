import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { showSuccessMessage } from "../constants/noti";

const FilterDropdown = ({ onFilterChange, onSortChange, onResetFilter }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  const filterLabels = {
    price: "Giá",
    rating: "Đánh giá",
  };

  const handleToggleExpand = () => {
    setModalVisible(!modalVisible);
  };

  const handleSortChange = (type) => {
    const newSortBy = sortBy === type ? `-${type}` : type;
    setSortBy(newSortBy);
    onSortChange(newSortBy); // Call the onSortChange prop
    setIsFiltered(true);
    showSuccessMessage(`Đã lọc theo ${filterLabels[type]}`); // Thêm thông báo
    setModalVisible(false);
  };

  const handleFilterChange = (type) => {
    handleSortChange(type); // Reuse sort change logic for filtering
  };

  const handleReset = () => {
    setSortBy(null); // Không áp dụng bộ lọc

    setIsFiltered(false); // Reset filter status
    setModalVisible(false); // Đóng modal
    showSuccessMessage("Đặt lại bộ lọc thành công");

    onResetFilter(); // Call the reset function
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const getFilterText = () => {
    if (sortBy) {
      const type = sortBy.startsWith("-") ? sortBy.substring(1) : sortBy;
      const order = sortBy.startsWith("-") ? " (tăng dần)" : " (  giảm dần)";
      return `Đang lọc theo ${filterLabels[type]}${order}`;
    }
    return "";
  };

  const getOptionText = (type) => {
    const order = sortBy === type ? " (tăng dần)" : " (  giảm dần)";
    return `Lọc theo ${filterLabels[type]}${order}`;
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={handleToggleExpand}
      >
        {isFiltered ? (
          <MaterialCommunityIcons name="filter-check" size={24} color="black" />
        ) : (
          <MaterialIcons name="filter-list" size={24} color="black" />
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.filterInfoText}>Lọc sản phẩm</Text>
            <Text style={styles.currentFilterText}>{getFilterText()}</Text>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleSortChange("price")}
            >
              <Text style={styles.optionText}>{getOptionText("price")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleSortChange("rating")}
            >
              <Text style={styles.optionText}>{getOptionText("rating")}</Text>
            </TouchableOpacity>
            {isFiltered && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#8B0000",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  filterInfoText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  currentFilterText: {
    marginBottom: 10,
    fontStyle: "italic",
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
  },
  resetButton: {
    marginTop: 10,
    alignItems: "center",
  },
  resetButtonText: {
    color: "red",
    fontSize: 16,
  },
});

export default FilterDropdown;
