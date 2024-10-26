const { width, getRandomNumber, centerTextWithBorders, colors, printDivider, countdown, centerTextmrhuang_ascii, mrhuang_ascii, infoMessages } = require('./0');
const fs = require('fs').promises;
const axios = require('axios');
const path = require('path');


// 辅助
// -----------------------------------------------------------------------------------------------------
const failedIds = new Set(); // 报错id 
const maxConcurrentThreads = 5; // 线程数
let currentIndex = 0; // 

const maxRetries = 3; // 最大重试次数


async function getIdsAndHashesFromJson() {
    try {
        const jsonContent = await fs.readFile('data/1.json', 'utf-8');
        const jsonData = JSON.parse(jsonContent);

        const idsAndHashes = jsonData.data.map(item => ({ id: item.id, hash: item.hash }));
        return idsAndHashes;
    } catch (error) {
        console.log(`${colors.green}${centerTextWithBorders('读取JSON文件出错', width)}${colors.reset}`);
        throw error;
    }
}

// 请求
// ----------------------------------------------------------------------------------------------------
async function post1(url, data) {
    try {
        const headers = {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'origin': 'https://www.thecubes.xyz',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://www.thecubes.xyz/',
            'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
        };
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// ----------------------------------------------------------------------------------------------------

async function get1(url) {
    try {
        const headers = {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'origin': 'https://www.thecubes.xyz',
            'priority': 'u=1, i',
            'referer': 'https://www.thecubes.xyz/',
            'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
        };
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// ----------------------------------------------------------------------------------------------------

// 主函数
async function processId(id, hash, threadNumber) {
    let token = '';
    let is_pool_watched = '';
    let table = '';
    const definedNumbers = Array.from({ length: 12 }, (_, i) => i);

    // ----------------------------------------------------------------------------------------------------
    // failedIds.add(id);
    // if (failedIds.has(id)) {
    //     console.log(`${colors.red}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id}的请求已经报错过，跳过此次请求 `, width)}${colors.reset}`);
    //     return; // 跳过已处理过失败的 ID
    // }

    try {
        console.log(`${colors.red}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 开始任务 `, width)}${colors.reset}`);
        // ----------------------------------------------------------------------------------------------------


        // 获取token
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线

        for (let attempts = 0; attempts < maxRetries; attempts++) {
            try {

                const url1 = 'https://server.questioncube.xyz/auth';
                const data1 = {
                    initData: hash,
                    newRefData: null
                };
                const res1 = await post1(url1, data1);
                token = res1.token;
                is_pool_watched = res1.is_pool_watched;

                console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取token成功 `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 用户 ID: ${res1.id} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` TG ID: ${res1.tg_id} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 挖矿次数: ${res1.mined_count} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 掉落物品数量: ${res1.drops_amount} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 箱子数量: ${res1.boxes_amount} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 能量: ${res1.energy} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 用户名: ${res1.username} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 是否已初始化 TG: ${res1.is_tg_initialized} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 是否监视池: ${res1.is_pool_watched} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 领取金额: ${res1.t_amount} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 访问令牌: ${res1.token} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 是否被禁止: ${res1.banned_until_restore} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 池 ID: ${res1.pool_id} `, width)}${colors.reset}`);


                // 打印 merge 内部信息
                table = res1.merge.table;
                console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                console.log(`${colors.blue}${centerTextWithBorders(` Merge 信息: `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 禁止合并: ${res1.merge.ban} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 可用掉落物品: ${res1.merge.drops} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 漏斗数据: ${JSON.stringify(res1.merge.table)} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 黄金数量: ${res1.merge.gold.n} , 乘数: ${res1.merge.gold.mul} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 已获得黄金: ${res1.merge.earned.gold.n} , 乘数: ${res1.merge.earned.gold.mul} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 购买记录: ${JSON.stringify(res1.merge.bought)} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 可用箱子: ${res1.merge.availableCrates || '无'} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 进化等级: ${res1.merge.evolution} `, width)}${colors.reset}`);


                break; // 成功后退出循环
            } catch (error) {
                console.error(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取token失败, 第 ${attempts + 1}/${maxRetries}次尝试, ${error.message}`, width)}${colors.reset}`);
                if (attempts === maxRetries - 1) {

                    console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                    return; // 跳过尝试失败的 ID
                }

                await countdown(3);

                console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
            }
        }


        // 获取池里面的余额
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线
        if (is_pool_watched) {
            try {

                const url1 = `https://server.questioncube.xyz/pools/claim?https%3A%2F%2Fserver.questioncube.xyz%2Fpools%2Fclaim=&token=${token}`;
                const res1 = await get1(url1);

                console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取池里面的余额成功 `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 获取池里面的余额: ${JSON.stringify(res1)}  `, width)}${colors.reset}`);


                console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                if (res1.claim > 1) {
                    try {
                        const url1 = `https://server.questioncube.xyz/pools/claim?https%3A%2F%2Fserver.questioncube.xyz%2Fpools%2Fclaim=&token=${token}`;
                        const data1 = {
                            token: token,
                        };
                        const res1 = await post1(url1, data1);

                        console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 领取池里面的余额成功 `, width)}${colors.reset}`);
                        console.log(`${colors.green}${centerTextWithBorders(` 领取池里面的余额: ${JSON.stringify(res1)}  `, width)}${colors.reset}`);
                    } catch (error) {
                        console.error(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 领取池里面的余额失败 ${error.message}`, width)}${colors.reset}`);
                        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                    }

                } else {
                    console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 当前可领取余额为 ${res1.claim}，小于或等于 1，不执行领取。`, width)}${colors.reset}`);
                    console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                }

            } catch (error) {
                console.error(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取池里面的余额失败 ${error.message}`, width)}${colors.reset}`);

                console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);

            }

        } else {
            console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 此池未被监视，跳过领取操作，执行加入池。`, width)}${colors.reset}`);

            // 执行加入池
            console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);

            try {
                const url1 = 'https://server.questioncube.xyz/pools/542/join';
                const data1 = {
                    token: token,
                };
                const res1 = await post1(url1, data1);

                console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 执行加入池成功 `, width)}${colors.reset}`);
                console.log(`${colors.blue}${centerTextWithBorders(` 加入池信息: `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 池 id: ${res1.pool.id} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 池名称: ${res1.pool.name} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 挖掘问题数量: ${res1.pool.minedQuestions} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 总挖掘问题数量: ${res1.pool.totalMinedQuestions} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 投资金额: ${res1.pool.invested} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 加入用户数量: ${res1.pool.joinedAmount} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 你的ID: ${res1.pool.me.id} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 你的名称: ${res1.pool.me.name} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 你的挖掘问题数量: ${res1.pool.me.minedQuestions} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 你的排名: ${res1.pool.me.rank} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 掉落物品数量: ${res1.drops_amount} `, width)}${colors.reset}`);
            } catch (error) {
                console.error(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 执行加入池失败${error.message}`, width)}${colors.reset}`);
                console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
            }


        }




        // 获取掉落箱子
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线

        for (let attempts = 0; attempts < maxRetries; attempts++) {
            try {

                const url1 = `https://server.questioncube.xyz/merge/crates?https%3A%2F%2Fserver.questioncube.xyz%2Fmerge%2Fcrates=&token=${token}`;
                const res1 = await get1(url1);


                console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取掉落箱子成功 `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 箱子: ${res1.crate ? '掉落成功' : '掉落失败'} `, width)}${colors.reset}`);

                // 获取 table 中的键并转为数字
                const tableKeys = Object.keys(table).map(Number);

                // 找出不在 table 中的数字
                const notInTable = definedNumbers.filter(num => !tableKeys.includes(num));

                // 创建一个用于存储相同值的对象
                const valueKeysMap = {};

                // 遍历 table，构建相同值的键数组
                for (const [key, value] of Object.entries(table)) {
                    if (!valueKeysMap[value]) {
                        valueKeysMap[value] = [];
                    }
                    valueKeysMap[value].push(key);
                }

                // 包括所有等级，包括不重复的等级
                const allKeys = Object.entries(valueKeysMap).map(([value, keys]) => {
                    return `等级 ${value}: 位置 ${keys.join(', ')}`;
                }).join(' | ');

                // 获取最大的等级
                const maxLevel = Math.max(...Object.keys(valueKeysMap).map(Number));

                console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取箱子不在格子位置成功 `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 获取所有格子位置: ${definedNumbers} `, width)}${colors.reset}`);

                console.log(`${colors.green}${centerTextWithBorders(` 获取箱子不在格子位置: ${notInTable} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 相同箱子等级所在的位置: ${allKeys} `, width)}${colors.reset}`);
                console.log(`${colors.green}${centerTextWithBorders(` 最大等级: ${maxLevel} `, width)}${colors.reset}`);
                let currentLvl = maxLevel <= 3 ? 0 : maxLevel - 3;
                let attempts = 0;
                console.log(`${colors.green}${centerTextWithBorders(` 设置参数: ${currentLvl} `, width)}${colors.reset}`);
                if (notInTable.length > 0) {
                    try {

                        const url1 = 'https://server.questioncube.xyz/merge';

                        // 根据 notInTable 构建 events 数组
                        const events = notInTable.map(position => ({
                            type: 'buy',
                            data: { id: position, lvl: currentLvl }
                        }));
                        const data1 = {
                            events: events,
                            token: token,
                        };
                        const res1 = await post1(url1, data1);
                        table = res1.table; // 更新
                        console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取购买掉落箱子成功 `, width)}${colors.reset}`);
                        console.log(`${colors.green}${centerTextWithBorders(` 箱子位置: ${JSON.stringify(res1.table)} `, width)}${colors.reset}`);
                        console.log(`${colors.green}${centerTextWithBorders(` 金币数据: ${JSON.stringify(res1.table)} `, width)}${colors.reset}`);
                        console.log(`${colors.green}${centerTextWithBorders(` 已获得数据: ${JSON.stringify(res1.earned)} `, width)}${colors.reset}`);
                        console.log(`${colors.green}${centerTextWithBorders(` 已购买数据: ${JSON.stringify(res1.bought)} `, width)}${colors.reset}`);

                        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                        console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 没有箱子不在格子位置的 `, width)}${colors.reset}`);
                        // 列出相同等级且位置数量大于 2 的箱子位置
                        const duplicatePositions = Object.entries(valueKeysMap)
                            .filter(([_, keys]) => keys.length >= 2)
                            .map(([value, keys]) => {
                                const numPairs = Math.floor(keys.length / 2);
                                // 构建从和到的位置数据
                                const pairs = [];
                                for (let i = 0; i < numPairs; i++) {
                                    pairs.push({
                                        from: keys[i * 2],
                                        to: keys[i * 2 + 1],
                                    });
                                }
                                return { level: value, pairs };
                            });
                        if (duplicatePositions.length > 0) {

                            console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 相同等级且数量大于 2 的箱子位置合成 `, width)}${colors.reset}`);
                            duplicatePositions.forEach(({ level, pairs }) => {
                                const pairStr = pairs.map(({ from, to }) => `从 ${to} 移到 ${from}`).join(' | ');
                                console.log(`${colors.green}${centerTextWithBorders(` 等级 ${level}: ${pairStr} `, width)}${colors.reset}`);
                            });

                            // 构建所有的事件数据
                            const eventsData = [];

                            for (const { pairs } of duplicatePositions) {

                                for (const { from, to } of pairs) {

                                    const fromInt = parseInt(from, 10);
                                    const toInt = parseInt(to, 10);
                                    eventsData.push({
                                        type: 'move',
                                        data: { from: fromInt, to: toInt }
                                    });

                                }

                            }
                            console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                            if (eventsData.length > 0) {
                                try {
                                    const url1 = 'https://server.questioncube.xyz/merge';
                                    
                                    const data1 = {
                                        events: eventsData,
                                        token: token,
                                    };
                                    // 发送请求
                                    const res1 = await post1(url1, data1);
                                    table = res1.table; // 更新
                                    console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取购买掉落箱子成功 `, width)}${colors.reset}`);
                                    console.log(`${colors.green}${centerTextWithBorders(` 箱子位置: ${JSON.stringify(res1.table)} `, width)}${colors.reset}`);
                                    console.log(`${colors.green}${centerTextWithBorders(` 金币数据: ${JSON.stringify(res1.gold)} `, width)}${colors.reset}`);
                                    console.log(`${colors.green}${centerTextWithBorders(` 已获得数据: ${JSON.stringify(res1.earned)} `, width)}${colors.reset}`);
                                    console.log(`${colors.green}${centerTextWithBorders(` 已购买数据: ${JSON.stringify(res1.bought)} `, width)}${colors.reset}`);
                                } catch (error) {
                                    console.error(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取购买掉落箱子失败, ${error.message}`, width)}${colors.reset}`);
                                }
                            }
                        } else {
                            console.log(`${colors.blue}${centerTextWithBorders(` 没有相同等级且数量大于 2 的箱子 `, width)}${colors.reset}`);
                        }
                        break;

                    } catch (error) {
                        console.error(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取购买掉落箱子失败, 第 ${attempts + 1}/${maxRetries}次尝试, ${error.message}`, width)}${colors.reset}`);
                        currentLvl--;
                        attempts++;

                        if (currentLvl < 0) {
                            console.log(`${colors.red}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 的请求全部失败，已跳过`, width)}${colors.reset}`);
                            break; // 如果 lvl 递减到 0，则跳过
                        }
                        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                    }

                } else {
                    console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                    console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 没有箱子不在格子位置的 `, width)}${colors.reset}`);
                    // 列出相同等级且位置数量大于 2 的箱子位置
                    const duplicatePositions = Object.entries(valueKeysMap)
                        .filter(([_, keys]) => keys.length >= 2)
                        .map(([value, keys]) => {
                            const numPairs = Math.floor(keys.length / 2);
                            // 构建从和到的位置数据
                            const pairs = [];
                            for (let i = 0; i < numPairs; i++) {
                                pairs.push({
                                    from: keys[i * 2],
                                    to: keys[i * 2 + 1],
                                });
                            }
                            return { level: value, pairs };
                        });
                    if (duplicatePositions.length > 0) {

                        console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 相同等级且数量大于 2 的箱子位置合成 `, width)}${colors.reset}`);
                        duplicatePositions.forEach(({ level, pairs }) => {
                            const pairStr = pairs.map(({ from, to }) => `从 ${to} 移到 ${from}`).join(' | ');
                            console.log(`${colors.green}${centerTextWithBorders(` 等级 ${level}: ${pairStr} `, width)}${colors.reset}`);
                        });

                        // 构建所有的事件数据
                        const eventsData = [];

                        for (const { pairs } of duplicatePositions) {

                            for (const { from, to } of pairs) {

                                const fromInt = parseInt(from, 10);
                                const toInt = parseInt(to, 10);
                                eventsData.push({
                                    type: 'move',
                                    data: { from: fromInt, to: toInt }
                                });

                            }

                        }
                        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                        if (eventsData.length > 0) {
                            try {
                                const url1 = 'https://server.questioncube.xyz/merge';
                                
                                const data1 = {
                                    events: eventsData,
                                    token: token,
                                };
                                // 发送请求
                                const res1 = await post1(url1, data1);
                                table = res1.table; // 更新
                                console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取购买掉落箱子成功 `, width)}${colors.reset}`);
                                console.log(`${colors.green}${centerTextWithBorders(` 箱子位置: ${JSON.stringify(res1.table)} `, width)}${colors.reset}`);
                                console.log(`${colors.green}${centerTextWithBorders(` 金币数据: ${JSON.stringify(res1.gold)} `, width)}${colors.reset}`);
                                console.log(`${colors.green}${centerTextWithBorders(` 已获得数据: ${JSON.stringify(res1.earned)} `, width)}${colors.reset}`);
                                console.log(`${colors.green}${centerTextWithBorders(` 已购买数据: ${JSON.stringify(res1.bought)} `, width)}${colors.reset}`);
                            } catch (error) {
                                console.error(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取购买掉落箱子失败, ${error.message}`, width)}${colors.reset}`);
                            }
                        }
                    } else {
                        console.log(`${colors.blue}${centerTextWithBorders(` 没有相同等级且数量大于 2 的箱子 `, width)}${colors.reset}`);
                    }


                }


                break; // 成功后退出循环
            } catch (error) {
                console.error(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 获取掉落箱子失败, 第 ${attempts + 1}/${maxRetries}次尝试, ${error.message}`, width)}${colors.reset}`);
                if (attempts === maxRetries - 1) {

                    console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
                    return; // 跳过尝试失败的 ID
                }

                await countdown(3);

                console.log(`${colors.blue}${printDivider(width)}${colors.reset}`);
            }
        }





        // ----------------------------------------------------------------------------------------------------

        console.log(`${colors.red}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id} 结束任务 `, width)}${colors.reset}`);
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线
    } catch (error) {
        console.log(`${colors.blue}${centerTextWithBorders(` 线程 ${threadNumber}: id为${id}的请求报错: ${error.message}`, width)}${colors.reset}`);
        failedIds.add(id); // 将失败的 ID 添加到集合中
    }
}



// ----------------------------------------------------------------------------------------------------


// 处理线程
async function handleThread(threadNumber, idsAndHashes) {
    while (true) {
        const index = currentIndex++; // 获取当前索引并自增
        if (index >= idsAndHashes.length) {
            break; // 如果索引超出范围，结束线程
        }

        const { id, hash } = idsAndHashes[index]; // 从 idsAndHashes 获取任务
        await processId(id, hash, threadNumber);
    }
}

async function main() {
    let loopCount = 0;
    while (true) {

        loopCount++;
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线
        console.log(`${colors.cyan}${centerTextmrhuang_ascii(mrhuang_ascii, width)}${colors.reset}`);
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线
        console.log(`${colors.green}${centerTextWithBorders(" cude箱子游戏批量脚本 ", width)}${colors.reset}`);
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线
        infoMessages.forEach(message => {
            console.log(`${colors.blue}${centerTextWithBorders(message, width)}${colors.reset}`);
        });
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线
        console.log(`${colors.blue}${centerTextWithBorders(` 开启: ${maxConcurrentThreads} 线程 `, width)}${colors.reset}`);
        console.log(`${colors.blue}${centerTextWithBorders(` 正在执行第: ${loopCount} 次循环 `, width)}${colors.reset}`);
        console.log(`${colors.blue}${centerTextWithBorders(" 程序正在执行请等待3秒时间", width)}${colors.reset}`);
        await countdown(3);
        console.log(`${colors.blue}${printDivider(width)}${colors.reset}`); // 分割线
        // ----------------------------------------------------------------------------------------------------
        // failedIds.clear();
        const idsAndHashes = await getIdsAndHashesFromJson();
        const threadPromises = [];
        for (let i = 0; i < maxConcurrentThreads; i++) {
            threadPromises.push(handleThread(i + 1, idsAndHashes));
        }

        await Promise.all(threadPromises);

        currentIndex = 0;
        console.log(`${colors.blue}${centerTextWithBorders(' 所有任务完成 ', width)}${colors.reset}`);

        const randomNumber = await getRandomNumber(10, 20);
        console.log(`${colors.blue}${centerTextWithBorders(` 重新开始,等待时间: ${randomNumber} 秒 `, width)}${colors.reset}`);
        await countdown(randomNumber);
    }
}


// 执行主函数
main();