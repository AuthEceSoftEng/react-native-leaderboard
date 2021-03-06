import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  FlatList,
  ViewPropTypes,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";

const oddRowColor = "white";
const evenRowColor = "#f2f5f7";

export default class Leaderboard extends Component {
  state = {
    sortedData: []
  };

  numberOfTries = 0;
  failed = true;

  static propTypes = {
    ...ViewPropTypes,
    //required
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    sortBy: PropTypes.string.isRequired,
    labelBy: PropTypes.string.isRequired,
    thisPlayer: PropTypes.object.isRequired,

    //optional
    sort: PropTypes.func,
    icon: PropTypes.string,
    onRowPress: PropTypes.func,
    renderItem: PropTypes.func,
    containerStyle: PropTypes.object,
    scoreStyle: PropTypes.object,
    rankStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    avatarStyle: PropTypes.object,
    oddRowColor: PropTypes.string,
    evenRowColor: PropTypes.string
  };

  _sort = data => {
    const sortBy = this.props.sortBy;

    let sorted = [];
    if (this.props.sort) {
      return this.props.sort(data);
    } else if (typeof data === "object") {
      let sortedKeys =
        data &&
        Object.keys(data).sort((key1, key2) => {
          return data[key2][sortBy] - data[key1][sortBy];
        });
      return (
        sortedKeys &&
        sortedKeys.map(key => {
          return data[key];
        })
      );
    } else if (typeof data === "array") {
      return (
        data &&
        data.sort((item1, item2) => {
          return item2[sortBy] - item1[sortBy];
        })
      );
    }
  };

  _defaultRenderItem = (item, index) => {
    const sortBy = this.props.sortBy;
    const evenColor = this.props.evenRowColor || evenRowColor;
    const oddColor = this.props.oddRowColor || oddRowColor;

    const rowColor = index % 2 === 0 ? evenColor : oddColor;

    const rowJSx = (
      <View style={[styles.row, { backgroundColor: (this.props.thisPlayer.player_id === item.player_id) ? '#EAC017' : rowColor }]} key={index}>
        <View style={styles.left}>
          <Text
            style={[
              styles.rank,
              this.props.rankStyle,
              index < 9 ? styles.singleDidget : styles.doubleDidget
            ]}
          >
            {parseInt(index) + 1}
          </Text>
          {this.props.icon && (
            <Image
              source={{ uri: item[this.props.icon] }}
              style={[styles.avatar, this.props.avatarStyle]}
            />
          )}
          <Text style={[styles.label, this.props.labelStyle]} numberOfLines={1}>
            {item[this.props.labelBy]}
          </Text>
        </View>
        <Text style={[styles.score, this.props.scoreStyle]}>
          {item[sortBy] || 0}
        </Text>
      </View>
    );

    return this.props.onRowPress ? (
      <TouchableOpacity onPress={e => this.props.onRowPress(item, index)}>
        {rowJSx}
      </TouchableOpacity>
    ) : (
      rowJSx
    );
  };

  _renderItem = (item, index) => {
    return this.props.renderItem
      ? this.props.renderItem(item, index)
      : this._defaultRenderItem(item, index);
  };

  componentWillMount() {
    this.setState({ sortedData: this._sort(this.props.data) });
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      try {
        this.failed = false;
        this.list.scrollToIndex({ index: this.props.thisPlayer.userRank - 1, viewOffset: 5, viewPosition: 0.5 })
        this.numberOfTries += 1;
        if (this.numberOfTries > 5 || !this.failed) clearInterval(this.interval)
      } catch (error) { /**/ }
    }, 750);
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.data !== nextProps.data) {
      this.setState({ sortedData: this._sort(nextProps.data) });
    }
  };

  componentWillUnmount() {
    clearInterval(this.timeout);
  }

  render() {

    return (
      <FlatList
        ref={(list => this.list = list)}
        initialNumToRender={this.props.thisPlayer.userRank + 20}
        style={this.props.containerStyle}
        data={this.state.sortedData}
        renderItem={({ item, index }) => this._renderItem(item, index)}
        keyExtractor={(item, index) => index.toString()}
        onScrollToIndexFailed={() => { this.failed = true }}
      />
    );
  }
}

const styles = StyleSheet.create({
  row: {
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 3,
    borderRadius: 15,
    borderColor: "transparent"
  },
  left: {
    flexDirection: "row",
    alignItems: "center"
  },
  rank: {
    fontSize: 17,
    fontWeight: "bold",
    marginRight: 5
  },
  singleDidget: {
    paddingLeft: 16,
    paddingRight: 6
  },
  doubleDidget: {
    paddingLeft: 10,
    paddingRight: 2
  },
  label: {
    fontSize: 17,
    flex: 1,
    paddingRight: 80
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
    position: "absolute",
    right: 15,
    paddingLeft: 15
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 30 / 2,
    marginRight: 10
  }
});
