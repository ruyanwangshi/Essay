class XSet extends Set{
    union(...sets) {
        return XSet.union(this, ...sets)
    }

    intersection(...sets) {
        return XSet.intersection(this, ...sets)
    }

    difference(set) {
        return XSet.difference(this, set)
    }

    symmetricDifference(set) {
        return XSet.symmetricDifference()
    }

    cartesianProduct(set) {
        return XSet.cartesianProduct(this, set)
    }

    powerSet() {
        return XSet.powerSet(this)
    }

    // 返回俩个或更多集合的并集(所有集合组成的唯一集合产生的并集)
    static union(a, ...bSets) {
        console.log(bSets)
        const unionSet = new XSet(a)
        for(const b of bSets) {
            for(const bValue of b) {
                unionSet.add(bValue)
            }
        }
        return unionSet
    }

    // 交集
    static intersection(a, ...bSets) {
        const intersectionSet = new  XSet(a)
        for(const aValue of intersectionSet) {
            for(const b of bSets) {
                if(!b.has(aValue)) {
                    console.log('aValue=>', aValue)
                }
                // console.log('aValue=>', b)
            }
            // console.log('aValue=>', aValue)
        }
    }
}
// console.log(XSet.union([1,2,3,4,5],[4,5,6,7,8,9]))
console.log(XSet.intersection([1,2,3,4,5],new Set([4,5,6,7,8,9])))