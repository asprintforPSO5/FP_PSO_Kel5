<template>
    <div class="search-menu">
        <input
            v-model="searchQuery"
            @input="onSearch"
            type="text"
            placeholder="Search..."
            class="search-input"
        />
        <ul v-if="filteredResults.length" class="search-results">
            <li v-for="(result, index) in filteredResults" :key="index">
                {{ result }}
            </li>
        </ul>
        <div v-else-if="searchQuery" class="no-results">
            No results found.
        </div>
    </div>
</template>

<script>
export default {
    name: "SearchMenu",
    data() {
        return {
            searchQuery: "",
            results: [
                "Apple",
                "Banana",
                "Orange",
                "Grape",
                "Pineapple",
                "Mango"
            ]
        };
    },
    computed: {
        filteredResults() {
            if (!this.searchQuery) return [];
            const query = this.searchQuery.toLowerCase();
            return this.results.filter(item =>
                item.toLowerCase().includes(query)
            );
        }
    },
    methods: {
        onSearch() {
            // You can emit an event or handle search logic here
        }
    }
};
</script>

<style scoped>
.search-menu {
    position: relative;
    width: 250px;
}
.search-input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}
.search-results {
    list-style: none;
    margin: 0;
    padding: 0;
    background: #fff;
    border: 1px solid #ddd;
    position: absolute;
    width: 100%;
    z-index: 10;
}
.search-results li {
    padding: 8px;
    cursor: pointer;
}
.search-results li:hover {
    background: #f0f0f0;
}
.no-results {
    padding: 8px;
    color: #888;
    background: #fff;
    border: 1px solid #ddd;
    position: absolute;
    width: 100%;
    z-index: 10;
}
</style>