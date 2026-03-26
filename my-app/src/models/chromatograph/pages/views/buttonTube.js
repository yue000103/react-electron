import React, { useState, useEffect } from "react";
import { Button, Slider } from "antd";
import "./buttonTube.css";
import color from "@components/color/index";
import { getAllTubes } from "../../api/status";
import { UpdateModuleListAPI,getModuleList } from "../../api/eluent_curve";
import useIndexedDB from "../../hooks/useIndexedDB";

let select_tube = [];
const initialGroupsOrigin = [];

const desc = [
    "0.1",
    "0.2",
    "0.3",
    "0.4",
    "0.5",
    "0.6",
    "0.7",
    "0.8",
    "0.9",
    "1",
];
const tubeV = 120;
let select_tube_flag = [];

// 新的数据格式：将mode和tubeValues合并为一个数组的元组
const initialModeAndValues = [];
let moduleList = [];

const App = ({
    num,
    callback,
    selected,
    clean_flag,
    selectedAllTubes,
    reverseFlag,
    methodRefreshKey,
}) => {


    const _ = require("lodash");

    const [selectedFlag, setSelectedFlags] = useState([]);
    const [cleanFlag, setCleanFlag] = useState(0);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [groupsOrigin, setGroupsOrigin] = useState(initialGroupsOrigin);
    const [modeAndValues, setModeAndValues] = useState(
        initialModeAndValues
    );
    const [groupsOfTen, setGroupsOfTen] = useState(
        _.cloneDeep(initialGroupsOrigin)
    );
    const [value, setValue] = useState([]);
    const [retainVolumeByModule, setRetainVolumeByModule] = useState({});
    const [moduleListDefaults, setModuleListDefaults] = useState([]);
    const storedMethodId = Number(localStorage.getItem("methodId")); // 转换为数字
    const { data, loading, error } = useIndexedDB(
        storedMethodId,
        methodRefreshKey
    ); // 使用 Hook

    const getSliderRangeValue = (sliderValue) => {
        if (Array.isArray(sliderValue)) {
            const upperValue = Number(sliderValue[1]);
            return [0, Number.isFinite(upperValue) ? upperValue : 0];
        }
        const upperValue = Number(sliderValue);
        return [0, Number.isFinite(upperValue) ? upperValue : 0];
    };

    const getSliderVolume = (sliderValue) =>
        getSliderRangeValue(sliderValue)[1];

    const handleRateChange = (newValue, index, subGroup) => {
        const updatedValue = [...value];
        updatedValue[index] = getSliderRangeValue(newValue);
        setValue(updatedValue);

        moduleList = modeAndValues
            .map((mode, modeIndex) => {
                const liquidVolume = getSliderVolume(
                    updatedValue[modeIndex]
                );
                const tubeId = Array.from(
                    { length: groupsOrigin[modeIndex]?.length || 0 },
                    (_, i) => i + 1
                );
                return {
                    module_id: mode[0],
                    liquid_volume: liquidVolume,
                    tube_id: tubeId,
                };
            })
            .filter((item) => item.liquid_volume > 0);
        UpdateModuleListAPI({ module_list: moduleList }).then(() => {});
        const nextVolumes = {};
        moduleList.forEach((item) => {
            const moduleId = Number(item.module_id);
            const volume = Number(item.liquid_volume);
            if (!Number.isNaN(moduleId) && Number.isFinite(volume)) {
                nextVolumes[moduleId] = volume;
            }
        });
        setRetainVolumeByModule(nextVolumes);
        console.log("1018  updatedValue", updatedValue, subGroup);
        console.log("1018  moduleList", moduleList);
    };

    useEffect(() => {
        getAllTubes().then((res) => {
            if (!res.error) {
                console.log("1024  res", res);
                setGroupsOrigin(res.data.groups_origin || []);
                setModeAndValues(res.data.mode_volume || []);
            }
        });
    }, []);

    useEffect(() => {
        getModuleList().then((res) => {
            if (res && !res.error) {
                const list = Array.isArray(res.data) ? res.data : [];
                setModuleListDefaults(list);
            }
        });
    }, [methodRefreshKey]);

    useEffect(() => {
        setGroupsOfTen(_.cloneDeep(groupsOrigin));
    }, [groupsOrigin]);

    function findColorByModuleAndTube(module_index, tube_index) {
        const matchingObject = selectedAllTubes.find(
            (item) =>
                item.module_index === module_index &&
                item.tube_index_list.includes(tube_index)
        );
        // 如果找到匹配对象，返回 color，否则返回 null
        return matchingObject ? matchingObject.color : null;
    }

    useEffect(() => {
        console.log("1018  num", num);
        console.log("1018  selectedAllTubes", selectedAllTubes);

        setCleanFlag(clean_flag);
        if (num.length == 0) {
            setGroupsOfTen(_.cloneDeep(groupsOrigin));
        }
        if (selected) {
            setSelectedFlags(selected);
            select_tube_flag = selected;
            callback(selected);
        } else {
            setSelectedFlags([]);
            select_tube_flag = [];
        }

        return () => {
            console.log("组件即将卸载，清除副作用...");
        };
    }, [num, selected, clean_flag, selectedAllTubes, groupsOrigin]);

    useEffect(() => {
        if (reverseFlag === 1) {

            setSelectedFlags((prevFlags) => {
                let filteredData = groupsOrigin.map(
                    (moduleData, moduleIndex) => {
                        return moduleData.filter((tubeData, tubeIndex) => {
                            // 检查是否需要排除
                            return !select_tube_flag.some(
                                (exclude) =>
                                    exclude.module_index === moduleIndex &&
                                    exclude.tube_index === tubeData.tube - 1
                            );
                        });
                    }
                );
                let result = [];
                filteredData.forEach((moduleData, moduleIndex) => {
                    moduleData.forEach((tubeData) => {
                        result.push({
                            module_index: moduleIndex,
                            tube_index: tubeData.tube - 1,
                        });
                    });
                });

                callback(result);
                return result;
            });
        }
    }, [reverseFlag]);

    useEffect(() => {
        console.log("1030  data", data);
        let retainList = [];
        if (data) {

            if (typeof data.retainList === "string") {
                try {
                    retainList = JSON.parse(data.retainList);
                } catch (error) {
                    retainList = [];
                }
            } else if (Array.isArray(data.retainList)) {
                retainList = data.retainList;
            }
        }

        const activeList =
            moduleListDefaults.length > 0 ? moduleListDefaults : retainList;
        if (!activeList || activeList.length === 0) {
            setValue(modeAndValues.map(() => [0, 0]));
            setRetainVolumeByModule({});
            return;
        }

        const nextVolumes = {};
        activeList.forEach((item) => {
            const moduleId = Number(item.module_id);
            const volume = Number(item.liquid_volume);
            if (!Number.isNaN(moduleId) && Number.isFinite(volume)) {
                nextVolumes[moduleId] = volume;
            }
        });
        setRetainVolumeByModule(nextVolumes);
        calculateRetainValues(setValue, activeList);
    }, [data, modeAndValues, moduleListDefaults]);
    const calculateRetainValues = (set, ListDy) => {
        const nextValues = modeAndValues.map(() => [0, 0]);

        if (modeAndValues.length > 0) {
            ListDy?.forEach((c) => {
                let mode = modeAndValues.filter(
                    (item) => item[0] === c["module_id"]
                );

                if (mode.length > 0) {
                    const moduleIndex = mode[0][0] - 1;
                    const volume = Number(c["liquid_volume"]);
                    nextValues[moduleIndex] = [
                        0,
                        Number.isFinite(volume) ? volume : 0,
                    ];
                }
            });
        }

        set(nextValues);
    };

    const getModuleIdByIndex = (groupIndex, subGroupIndex) => {
        const moduleIndex = groupIndex * 4 + subGroupIndex;
        const moduleId = moduleIndex + 1;
        return Number.isNaN(moduleId) ? null : moduleId;
    };

    const getMaxVolumeByModuleId = (moduleId) => {
        if (moduleId === null) {
            return null;
        }
        const match = modeAndValues.find(
            (item) => Number(item?.[0]) === moduleId
        );
        const maxVolume = match ? Number(match[1]) : null;
        return Number.isFinite(maxVolume) ? maxVolume : null;
    };

    const getRetainVolumeByIndex = (groupIndex, subGroupIndex) => {
        const moduleId = getModuleIdByIndex(groupIndex, subGroupIndex);
        if (moduleId === null) {
            return null;
        }
        const volume = retainVolumeByModule[moduleId];
        if (!Number.isFinite(volume)) {
            return null;
        }
        const maxVolume = getMaxVolumeByModuleId(moduleId);
        if (maxVolume !== null && volume > maxVolume) {
            return maxVolume;
        }
        return volume;
    };

    const getCurrentTubeVolume = (groupIndex, subGroupIndex) => {
        const volume = getRetainVolumeByIndex(groupIndex, subGroupIndex);
        if (volume === null) {
            // 尚未设置保留体积
            return null;
        }
        return volume;
    };

    const handleButtonClick = (tube_i, module, groupIndex, subGroupIndex) => {
        setSelectedFlags((prevFlags) => {
            const isSelected = prevFlags.some(
                (f) => f.module_index === module && f.tube_index === tube_i
            );

            let nextFlags = [];

            if (isSelected) {
                // 取消选中
                nextFlags = prevFlags.filter(
                    (f) =>
                        !(f.module_index === module && f.tube_index === tube_i)
                );
            } else {
                const existingModuleTubes = prevFlags.filter(
                    (f) => f.module_index === module
                );

                if (existingModuleTubes.length > 0) {
                    // 同模块范围选择：连选上一个到当前之间的所有试管
                    const lastSelectedTube =
                        existingModuleTubes[existingModuleTubes.length - 1];
                    const startTube = lastSelectedTube.tube_index;

                    const newFlags = Array.from(
                        {
                            length: Math.abs(tube_i - startTube) + 1,
                        },
                        (_, i) => ({
                            module_index: module,
                            tube_index: Math.min(tube_i, startTube) + i,
                        })
                    ).filter(
                        (t) =>
                            !prevFlags.some(
                                (f) =>
                                    f.module_index === t.module_index &&
                                    f.tube_index === t.tube_index
                            )
                    );

                    nextFlags = [...prevFlags, ...newFlags];
                } else {
                    // 新模块首次选中
                    nextFlags = [
                        ...prevFlags,
                        { module_index: module, tube_index: tube_i },
                    ];
                }
            }

            select_tube_flag = nextFlags;
            callback(nextFlags);
            return nextFlags;
        });
    };
    const chunkArray = (array, chunkSize) => {
        const results = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            results.push(array.slice(i, chunkSize + i));
        }
        return results;
    };

    const calculateIndex = (row, col) => row * 4 + col;

    const getModeAndValue = (index) => {
        // 确保index不超过modeAndValues数组长度
        const safeIndex = index % modeAndValues.length;
        return modeAndValues[safeIndex];
    };

    return (
        <div className="button-div">
            {groupsOfTen.map((subGroup, moduleIndex) => {
                const groupIndex = Math.floor(moduleIndex / 4);
                const subGroupIndex = moduleIndex % 4;
                const indexedSubGroup = subGroup.map((_, tubeIndex) => ({
                    tubeIndex,
                }));
                const tubeColumns = chunkArray(indexedSubGroup, 5);
                const moduleOffset = groupsOfTen
                    .slice(0, moduleIndex)
                    .reduce((sum, group) => sum + group.length, 0);

                return (
                    <div
                        className="card"
                        key={`module-${moduleIndex}`}
                    >
                        <div className="card__content">
                            <div className="card__tubes">
                                {tubeColumns.map(
                                    (column, columnIndex) => {
                                        const columnItems =
                                            columnIndex % 2 === 0
                                                ? column
                                                : [...column].reverse();
                                        return (
                                            <div
                                                className="card__tubeCol"
                                                key={`col-${columnIndex}`}
                                            >
                                                {columnItems.map(
                                                    (cell) => {
                                                        const {
                                                            tubeIndex,
                                                        } = cell;
                                                        let tube_i =
                                                            tubeIndex;
                                                        const tube =
                                                            moduleOffset +
                                                            tubeIndex +
                                                            1;

                                                        const isSelected =
                                                            selectedFlag.some(
                                                                (flag) =>
                                                                    flag.module_index ===
                                                                        moduleIndex &&
                                                                    flag.tube_index ===
                                                                        tube_i
                                                            );

                                                        let isNum = false;

                                                        num.forEach(
                                                            (n) => {
                                                                const {
                                                                    module_index,
                                                                    tube_index,
                                                                    time_start,
                                                                    time_end,
                                                                } = n;

                                                                if (
                                                                    module_index ===
                                                                    moduleIndex
                                                                ) {
                                                                    groupsOfTen[
                                                                        module_index
                                                                    ][
                                                                        tube_index
                                                                    ].time_start =
                                                                        time_start;
                                                                    groupsOfTen[
                                                                        module_index
                                                                    ][
                                                                        tube_index
                                                                    ].time_end =
                                                                        time_end;
                                                                    if (
                                                                        tube_index ===
                                                                        tube_i
                                                                    ) {
                                                                        isNum = true;
                                                                    }
                                                                }
                                                            }
                                                        );

                                                        let buttonColorStyle =
                                                            {};

                                                        if (!isNum && cleanFlag != 1) {
                                                            buttonColorStyle =
                                                                color[
                                                                    "colorEight"
                                                                ];
                                                        }
                                                        let colorTube =
                                                            findColorByModuleAndTube(
                                                                moduleIndex,
                                                                tube_i
                                                            );
                                                        if (colorTube) {
                                                            let colorName = `color${colorTube}`;
                                                            buttonColorStyle =
                                                                color[
                                                                    colorName
                                                                ];
                                                        }

                                                        return (
                                                            <div
                                                                key={tubeIndex}
                                                                onClick={() =>
                                                                    handleButtonClick(
                                                                        tube_i,
                                                                        moduleIndex,
                                                                        groupIndex,
                                                                        subGroupIndex
                                                                    )
                                                                }
                                                                className="card_buttton"
                                                            >
                                                                <Button
                                                                    shape="circle"
                                                                    className="buttonTubes"
                                                                    disabled={false}
                                                                    style={{
                                                                        backgroundColor:
                                                                            isSelected
                                                                                ? "#d5d5f5"
                                                                                : "",
                                                                        color: "#010101",
                                                                        ...buttonColorStyle,
                                                                    }}
                                                                >
                                                                    {tube}
                                                                </Button>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                            <Slider
                                vertical
                                range
                                step={10}
                                min={0}
                                max={
                                    modeAndValues[moduleIndex]?.[1] || 0
                                }
                                defaultValue={[
                                    0,
                                    getRetainVolumeByIndex(
                                        groupIndex,
                                        subGroupIndex
                                    ) || 0,
                                ]}
                                value={getSliderRangeValue(
                                    value[moduleIndex]
                                )}
                                onChange={(newValue) =>
                                    handleRateChange(
                                        newValue,
                                        moduleIndex,
                                        subGroup
                                    )
                                }
                                style={{
                                    height: 120,
                                    marginLeft: 8,
                                    flexShrink: 0,
                                }}
                            />
                        </div>
                        <span className="card__label">
                            {(() => {
                                const moduleLabel = getModuleIdByIndex(
                                    groupIndex,
                                    subGroupIndex
                                );
                                const retainVolume = getRetainVolumeByIndex(
                                    groupIndex,
                                    subGroupIndex
                                );
                                if (retainVolume === null) {
                                    return `${moduleLabel}模块`;
                                }
                                return `${moduleLabel}模块 - ${retainVolume} ml`;
                            })()}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default App;
