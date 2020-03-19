<template>
  <div class="tagList">
    <p class="tagCount" v-show="tagCount">{{ tagCountDisplay }}</p>
    <ul class="tags">
      <li v-for="(tag, index) in tags" v-bind:key="index" v-on:click="selectTag(tag)">
        <a :href="tag.url" v-on:click.prevent>{{tag.hashtag}}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { pluralize } from "@/utils.js";
import { mapState } from "vuex";

export default {
  name: "TagList",
  computed: {
    tagCountDisplay() {
      const tagCount = this.tagCount;
      if (tagCount) {
        return pluralize(tagCount, "tag");
      }
    },
    ...mapState({
      tagCount: state => state.tags.count,
      tags: state => state.tags.tags
    }),
  },
  methods: {
    selectTag(tag) {
      this.$store.dispatch("selectTag", tag);
    }
  }
}
</script>

<style lang="scss">
.tagList {
  margin: 0;
}

.tagCount {
  color: $secondaryTextColor;
  margin: 5px;
  text-align: left;
}

ul.tags {
  display:flex;
  flex-flow: row wrap;
  justify-content: left;
  list-style-type: none;
  margin: 0 0 15px 0;
  padding: 0;

  li {
    cursor: pointer;
    display: inline-block;
    list-style: none;
    padding: 5px;
    white-space: normal;

    color: $primaryTextColor;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
  }

  a {
    font-size: 16px;
    color: $linkTextColor;
  }

}
</style>
