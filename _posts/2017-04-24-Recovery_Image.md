---
layout: post
title:  "RecoveryImg"
date:   2017-04-24 22:55:18 +0800
categories: RecoveryImg
tag: recovery img
type: C
---

#### 恢复删除照片（JPEG格式）
[wikipedia](https://en.wikipedia.org/wiki/JPEG)
也可以看[JPEG文件编/解码详解](http://blog.csdn.net/lpt19832003/article/details/1713718)

想要恢复图片首先需要了解图片文件格式头和尾

- JPEG头：`0xFFD8FFE0` / `0xFFD8FFE1`
- JPEG结尾 `0xFFD9`
在data镜像文件中存放JPEG得所有头都是对齐得，判断是否为JPEG格式的图片：

```
bool findNewImage(void) {
    return (memcmp(bufcpy, "\xFF\xD8\xFF\xE0", 4) == 0 ||
            memcmp(bufcpy, "\xFF\xD8\xFF\xE1", 4) == 0) ? true : false;
}
```
大概过程如下：

```

#define _LARGEFILE64_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>
#include <errno.h>
#include <fcntl.h>
#include <stdbool.h>

typedef uint8_t BYTE;
const char *ACTION_HELP = "--help";
const char *ACTION_SIZE = "--length";
const char *ACTION_GET_DATA = "--getData";
const char *ACTION_SCANNING = "--scanning";

const char *HELP = "recover [filePath] <blockSize> <start> <end> <outPath> [--action]\nfilePath:文件路径；\nblockSize：块大小 -- 扫描文件时传入blockSize，默认512\nstart end：获取图片byte[]时必须传入开始和结尾位置，outPath ：文件输出路径\n --action: 1、length:文件长度；2、getData:获取图片byte[];3、scanning：扫描文件\n";
BYTE *buffer = NULL;
BYTE *bufcpy = NULL;
unsigned int blockSize = 512;

int64_t getFileLength(const char *filePath);

int fseek_64(FILE *stream, int64_t offset, int origin);

void getData(const char *filePath, const char *outPath, long long start, long long end);

void writeToImage(const char *outPath, BYTE *byte, unsigned int block);

bool findNewImage(void);

void recover(const char *filePath, const char *outPath);

int main(int argc, char **argv) {
    if (argc < 2) {
        printf("recover [--help]\n");

        return 0;
    }

    const char *action = argv[argc - 1];

    if (strcmp(action, ACTION_HELP) == 0 || argc <= 2) {
        printf(HELP);
        return 0;
    }
    const char *filePath = argv[1];

    if (strcmp(action, ACTION_SIZE) == 0) {
        const long long length = getFileLength(filePath);
        printf("length %lld \n", length);
        return 1;
    }

    if (strcmp(action, ACTION_SCANNING) == 0) {

        if (argc > 3) {
            int b = atoi(argv[2]);
            blockSize = (unsigned int) (b * 1000);
        } else blockSize = 512 * 1000;
        const char *outPath = argv[3];
        recover(filePath, outPath);
        return 1;
    }

    if (strcmp(action, ACTION_GET_DATA) == 0) {
        long long start = atoll(argv[2]);
        long long end = atoll(argv[3]);
        char *outPath = argv[4];
        int strLength = (int) strlen(outPath);
        printf("outPath length = %d\n", strLength);
        getData(filePath, outPath, start, end);
        return 1;
    }


}

int64_t getFileLength(const char *filePath) {
    FILE *file = fopen(filePath, "rb");
    if (file == NULL) {
        return errno;
    }
    int fd = fileno(file);
    long long length = lseek64(fd, 0, SEEK_END);
    fclose(file);
    return length;
}

void recover(const char *filePath, const char *outPath) {
    long long start = 0;//图片起始位置
    long long end = 0;//图片结束位置
    FILE *inptr = fopen(filePath, "rb");
    // create counter to track how many images received and use as counter.jpg as file name (first image is 001.jpg)
    int jpegCount = 1;

    //  starts off initially with no images found
    bool foundJpeg = false;
    if (inptr == NULL) {
        printf("Could not open %s\n", filePath);
        return;
    }
    // create buffer which we will read to
    fseek(inptr, 0, SEEK_SET);
    buffer = malloc(sizeof(BYTE) * blockSize);
    unsigned int perSize = blockSize / 1000;
    bufcpy = malloc(sizeof(BYTE) * perSize);
    unsigned long long index = 0;
    int readsize = 0;
    // we read 512 bytes at a time and only check the first 4 bytes of the buffer for jpeg signatures
    while ((readsize = fread(buffer, 1, blockSize, inptr)) != 0) {
        if (readsize == blockSize) {
            long long length = index * blockSize;
            printf("progress %lld \n", length);
            int i = 0;
            int totalsize = 0;
            for (i; i < 1000; ++i) {
                memcpy(bufcpy, buffer + totalsize, perSize);
                totalsize += perSize;
                if (foundJpeg == true) {
                    if (findNewImage() == true) {
                        end = index * blockSize + i * perSize;
                        long long len = end - start;
                        if (len < 5 * 1024 * 1024) {
                            char fileName[100] = {0};
                            sprintf(fileName, "%s%lld%d", outPath, index, i);
                            getData(filePath, fileName, start, end);
                            printf("save path %s %lld %lld\n", fileName, start, end);
                        }

                        start = index * blockSize + i * perSize;
                    }
                }
                else if (findNewImage() ==
                         true) // keep reading the card until we find the first image
                {
                    foundJpeg = true;
                    start = index * blockSize + i * perSize;
                }
            }

        } else {
            printf("scanning end\n");
            break;
        }

        index++;
    }
    // free buffer since we used malloc to allocate memory for it in the heap
    free(buffer);
    fclose(inptr);
    printf("scanning end\n");

}

void getData(const char *filePath, const char *outPath, long long start, long long end) {
    BYTE *buf = NULL;
    long long poor = end - start;
    printf(" ===== poor %lld ======== start %lld ======== end %lld\n", poor, start, end);
// TODO
    FILE *file = fopen(filePath, "rb");
    if (file == NULL)
        return;
    buf = malloc(sizeof(BYTE) * poor);
    if (buf == NULL) {
        printf("== %s 打开失败！\n", filePath);
        fclose(file);
        return;
    }
    fseek_64(file, start, SEEK_SET);
    fread(buf, sizeof(BYTE) * poor, 1, file);

    FILE *outptr = fopen(outPath, "wb");
    if (outptr == NULL) {
        printf("couldn't open the outfile\n");
        return;
    }
    fwrite(buf, sizeof(BYTE) * poor, 1, outptr); // write contents from buffer to the outfile
    printf("write file is true\n");
    fclose(outptr);
    free(buf);
    fclose(file);
}


int fseek_64(FILE *stream, int64_t offset, int origin) {
    if (feof(stream)) {
        rewind(stream);
    }
    else {
        setbuf(stream, NULL); //清空fread的缓存
    }
    int fd = fileno(stream);
    if (lseek64(fd, offset, origin) == -1) {
        return errno;
    }
    return 0;
}

bool findNewImage(void) {
    // return (buffer[0] == 0xff && buffer[1] == 0xd8 && buffer[2]== 0xff && (buffer[3]== 0xe0 || buffer[3]==0xe1) ) ? true : false;
    return (memcmp(bufcpy, "\xFF\xD8\xFF\xE0", 4) == 0 ||
            memcmp(bufcpy, "\xFF\xD8\xFF\xE1", 4) == 0) ? true : false;
}

void writeToImage(const char *outPath, BYTE *byte, unsigned int block) {
    // name found files as ###.jpg so need an extra for null character

    FILE *outptr = fopen(outPath, "a");
    if (outptr == NULL) {
        printf("couldn't open the outfile\n");
        return;
    }
    fwrite(byte, block, 1, outptr); // write contents from buffer to the outfile
    fclose(outptr);
    printf("save path %s\n", outPath);

}
```


