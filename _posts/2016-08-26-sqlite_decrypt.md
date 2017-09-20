---
layout: post
title:  "Android SQLite decrypt"
date:   2016-08-26 11:36:18 +0800
categories: SQLite
tag: SQLite decrypt、微信数据库解密
type: SQLite
---
# SQLite decrypt tools

##### 解密数据库文件
1> C/C++


```
#include <jni.h>
#include <stdio.h>
#include <string.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/hmac.h>

#define ERROR(X)  {printf("[ERROR] iteration %d: ", i); printf X;fflush(stdout);}
#define PAGESIZE 1024
#define PBKDF2_ITER 64000
#define FILE_HEADER_SZ 16

JNIEXPORT jint JNICALL
Java_com_xiaoxiaoying_tools_jni_WeChatJNI_decrypt(JNIEnv *env, jobject instance, jstring pwd_,
                                           jstring inFile_, jstring outFile_) {
    const char *pass = (*env)->GetStringUTFChars(env, pwd_, 0);
    const char *infile = (*env)->GetStringUTFChars(env, inFile_, 0);
    const char *outfile = (*env)->GetStringUTFChars(env, outFile_, 0);


    int i, csz, tmp_csz, key_sz, iv_sz, block_sz, hmac_sz, reserve_sz;
    FILE *infh, *outfh;
    int read, written;
    unsigned char *inbuffer, *outbuffer, *salt, *out, *key, *iv;
    EVP_CIPHER *evp_cipher;
    EVP_CIPHER_CTX ectx;

    OpenSSL_add_all_algorithms();

    evp_cipher = (EVP_CIPHER *) EVP_get_cipherbyname("aes-256-cbc");

    key_sz = EVP_CIPHER_key_length(evp_cipher);
    key = malloc(key_sz);

    iv_sz = EVP_CIPHER_iv_length(evp_cipher);
    iv = malloc(iv_sz);

    hmac_sz = EVP_MD_size(EVP_sha1());
    block_sz = EVP_CIPHER_block_size(evp_cipher);

    reserve_sz = iv_sz + hmac_sz;
    reserve_sz = ((reserve_sz % block_sz) == 0) ? reserve_sz : ((reserve_sz / block_sz) + 1) * block_sz;

    inbuffer = (unsigned char *) malloc(PAGESIZE);
    printf("%x\n",&inbuffer);
    outbuffer = (unsigned char *) malloc(PAGESIZE);
    salt = malloc(FILE_HEADER_SZ);
    infh = fopen(infile, "rb");
    outfh = fopen(outfile, "wb");

    read = fread(inbuffer, 1, PAGESIZE, infh);  /* read the first page */
    memcpy(salt, inbuffer, FILE_HEADER_SZ); /* first 16 bytes are the random database salt */

    PKCS5_PBKDF2_HMAC_SHA1(pass, strlen(pass), salt, FILE_HEADER_SZ, PBKDF2_ITER, key_sz, key);
    memset(outbuffer, 0, PAGESIZE);
    out = outbuffer;
    unsigned char *c = inbuffer + PAGESIZE - iv_sz;
    memcpy(iv, inbuffer + PAGESIZE - reserve_sz, iv_sz); /* last iv_sz bytes are the initialization vector */

    EVP_CipherInit(&ectx, evp_cipher, NULL, NULL, 0);
    EVP_CIPHER_CTX_set_padding(&ectx, 0);
    EVP_CipherInit(&ectx, NULL, key, iv, 0);
    
    EVP_CipherUpdate(&ectx, out, &tmp_csz, inbuffer + FILE_HEADER_SZ, PAGESIZE - reserve_sz - FILE_HEADER_SZ);
    csz = tmp_csz;
    out += tmp_csz;
    EVP_CipherFinal(&ectx, out, &tmp_csz);
    csz += tmp_csz;
    EVP_CIPHER_CTX_cleanup(&ectx);

    fwrite("SQLite format 3\0", 1, FILE_HEADER_SZ, outfh);
    fwrite(outbuffer, 1, PAGESIZE - FILE_HEADER_SZ, outfh);

    printf("wrote page %d\n", 0);

    for (i = 1; (read = fread(inbuffer, 1, PAGESIZE, infh)) > 0; i++) {
        memcpy(iv, inbuffer + PAGESIZE - reserve_sz, iv_sz); /* last iv_sz bytes are the initialization vector */
        memset(outbuffer, 0, PAGESIZE);
        out = outbuffer;

        EVP_CipherInit(&ectx, evp_cipher, NULL, NULL, 0);
        EVP_CIPHER_CTX_set_padding(&ectx, 0);
        EVP_CipherInit(&ectx, NULL, key, iv, 0);
        EVP_CipherUpdate(&ectx, out, &tmp_csz, inbuffer, PAGESIZE - reserve_sz);
        csz = tmp_csz;
        out += tmp_csz;
        EVP_CipherFinal(&ectx, out, &tmp_csz);
        csz += tmp_csz;
        EVP_CIPHER_CTX_cleanup(&ectx);

        fwrite(outbuffer, 1, PAGESIZE, outfh);
        printf("wrote page %d\n", i);
    }

    fclose(infh);
    fclose(outfh);

    free(inbuffer);
    free(outbuffer);
    free(key);
    free(salt);
    free(iv);

    return 0;


}
```

结果解不开2.1版本的数据库,然后查找提交的 [历史记录][2] 解密2.1版本的数据库

C/C++

```
#include <jni.h>
#include <stdio.h>
#include <string.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/hmac.h>

#define ERROR(X)  {printf("[ERROR] iteration %d: ", i); printf X;fflush(stdout);}
#define PAGESIZE 1024
#define PBKDF2_ITER 4000
#define FILE_HEADER_SZ 16

JNIEXPORT jint JNICALL
Java_com_xiaoxiaoying_tools_jni_WeChatJNI_decrypt(JNIEnv *env, jobject instance, jstring pwd_,
                                           jstring inFile_, jstring outFile_) {
    const char *pass = (*env)->GetStringUTFChars(env, pwd_, 0);
    const char *infile = (*env)->GetStringUTFChars(env, inFile_, 0);
    const char *outfile = (*env)->GetStringUTFChars(env, outFile_, 0);


    int i, csz, tmp_csz, key_sz, iv_sz/*, block_sz, hmac_sz, reserve_sz*/;
    FILE *infh, *outfh;
    int read, written;
    unsigned char *inbuffer, *outbuffer, *salt, *out, *key, *iv;
    EVP_CIPHER *evp_cipher;
    EVP_CIPHER_CTX ectx;

//    OpenSSL_add_all_algorithms();

    evp_cipher = (EVP_CIPHER *) EVP_get_cipherbyname("aes-256-cbc");

    key_sz = EVP_CIPHER_key_length(evp_cipher);
    key = malloc(key_sz);

    iv_sz = EVP_CIPHER_iv_length(evp_cipher);
    iv = malloc(iv_sz);

//    hmac_sz = EVP_MD_size(EVP_sha1());
//
//    block_sz = EVP_CIPHER_block_size(evp_cipher);
//
//    reserve_sz = iv_sz + hmac_sz;
//    reserve_sz = ((reserve_sz % block_sz) == 0) ? reserve_sz : ((reserve_sz / block_sz) + 1) * block_sz;

    inbuffer = (unsigned char *) malloc(PAGESIZE);
    printf("%x\n",&inbuffer);
    outbuffer = (unsigned char *) malloc(PAGESIZE);
    salt = malloc(FILE_HEADER_SZ);

    infh = fopen(infile, "r");
    outfh = fopen(outfile, "w");
//    infh = fopen(infile, "rb");
//    outfh = fopen(outfile, "wb");

    read = fread(inbuffer, 1, PAGESIZE, infh);  /* read the first page */
    memcpy(salt, inbuffer, FILE_HEADER_SZ); /* first 16 bytes are the random database salt */

    PKCS5_PBKDF2_HMAC_SHA1(pass, strlen(pass), salt, FILE_HEADER_SZ, PBKDF2_ITER, key_sz, key);
    memset(outbuffer, 0, PAGESIZE);
    out = outbuffer;
    unsigned char *c = inbuffer + PAGESIZE - iv_sz;
//    printf()
    memcpy(iv, c, iv_sz); /* last iv_sz bytes are the initialization vector */
//    memcpy(iv, inbuffer + PAGESIZE - reserve_sz, iv_sz); /* last iv_sz bytes are the initialization vector */

    EVP_CipherInit(&ectx, evp_cipher, NULL, NULL, 0);
    EVP_CIPHER_CTX_set_padding(&ectx, 0);
    EVP_CipherInit(&ectx, NULL, key, iv, 0);
    EVP_CipherUpdate(&ectx, out, &tmp_csz, inbuffer + FILE_HEADER_SZ,
                     PAGESIZE - iv_sz - FILE_HEADER_SZ);
//    EVP_CipherUpdate(&ectx, out, &tmp_csz, inbuffer + FILE_HEADER_SZ, PAGESIZE - reserve_sz - FILE_HEADER_SZ);
    csz = tmp_csz;
    out += tmp_csz;
    EVP_CipherFinal(&ectx, out, &tmp_csz);
    csz += tmp_csz;
    EVP_CIPHER_CTX_cleanup(&ectx);

    fwrite("SQLite format 3\0", 1, FILE_HEADER_SZ, outfh);
    fwrite(outbuffer, 1, PAGESIZE - FILE_HEADER_SZ, outfh);

    printf("wrote page %d\n", 0);

    for (i = 1; (read = fread(inbuffer, 1, PAGESIZE, infh)) > 0; i++) {
//        memcpy(iv, inbuffer + PAGESIZE - reserve_sz, iv_sz); /* last iv_sz bytes are the initialization vector */
        memcpy(iv, inbuffer + PAGESIZE - iv_sz,
               iv_sz); /* last iv_sz bytes are the initialization vector */
        memset(outbuffer, 0, PAGESIZE);
        out = outbuffer;

        EVP_CipherInit(&ectx, evp_cipher, NULL, NULL, 0);
        EVP_CIPHER_CTX_set_padding(&ectx, 0);
        EVP_CipherInit(&ectx, NULL, key, iv, 0);
        EVP_CipherUpdate(&ectx, out, &tmp_csz, inbuffer, PAGESIZE - iv_sz);
//        EVP_CipherUpdate(&ectx, out, &tmp_csz, inbuffer, PAGESIZE - reserve_sz);
        csz = tmp_csz;
        out += tmp_csz;
        EVP_CipherFinal(&ectx, out, &tmp_csz);
        csz += tmp_csz;
        EVP_CIPHER_CTX_cleanup(&ectx);

        fwrite(outbuffer, 1, PAGESIZE, outfh);
        printf("wrote page %d\n", i);
    }

    fclose(infh);
    fclose(outfh);

    free(inbuffer);
    free(outbuffer);
    free(key);
    free(salt);
    free(iv);

    return 0;


}

```

2> Java 解密

在 `app` > `build.gradle` 中添加

`compile 'org.bouncycastle:bcprov-jdk16:1.46'`


```
    private static int PBKDF_ITER = 4000;
    private static int FILE_HEADER_SZ = 16;
    private static int IV_SIZE = 16;
    private static final int PBKDF2_KEY_SIZE = 256; // bits
    private final static String MECHANISM = "AES/CBC/NoPadding";

    public static void decryptDB(String inputPath, String outputPath, String pwd) {
        if (TextUtils.isEmpty(inputPath)) {
            throw new NullPointerException("output path is null");
        }

        if (TextUtils.isEmpty(outputPath)) {
            throw new NullPointerException("input path is null");
        }
        try {
            File file = new File(inputPath);
            RandomAccessFile accessFile = new RandomAccessFile(file, "r");
            FileOutputStream outputStream = new FileOutputStream(outputPath);

            byte[] inbuffer = new byte[1024];
            byte[] salt = new byte[FILE_HEADER_SZ];
            accessFile.read(inbuffer, 0, 1024);
            System.arraycopy(inbuffer, 0, salt, 0, FILE_HEADER_SZ);
            Key key = androidPBKDF2(pwd.toCharArray(), salt, PBKDF_ITER, true);

            byte[] ivByte = new byte[IV_SIZE];
            System.arraycopy(inbuffer, 1024 - IV_SIZE, ivByte, 0, IV_SIZE);
            Cipher cipher = Cipher.getInstance(MECHANISM);

            IvParameterSpec ivSpace = new IvParameterSpec(ivByte);
            cipher.init(Cipher.DECRYPT_MODE, key, ivSpace);
            byte[] plaintText = new byte[1024 - FILE_HEADER_SZ];
            cipher.doFinal(inbuffer, FILE_HEADER_SZ, 1024 - FILE_HEADER_SZ * 2, plaintText, 0);
            String headStr = "SQLite format 3\0";
            outputStream.write(headStr.getBytes());
            outputStream.flush();
            outputStream.write(plaintText);
            outputStream.flush();

            long blockCount = file.length() / 1024;

            for (int i = 1; i < blockCount; i++) {

                accessFile.seek(i * 1024);
                accessFile.read(inbuffer, 0, 1024);
                decrypt(inbuffer, key, outputStream);
            }


            outputStream.close();
            accessFile.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private static void decrypt(byte[] inbuffer, Key key, FileOutputStream outputStream) throws Exception {
        byte[] ivByte = new byte[IV_SIZE];
        System.arraycopy(inbuffer, 1024 - FILE_HEADER_SZ, ivByte, 0, FILE_HEADER_SZ);
        Cipher cipher = Cipher.getInstance(MECHANISM);

        IvParameterSpec ivSpace = new IvParameterSpec(ivByte);
        cipher.init(Cipher.DECRYPT_MODE, key, ivSpace);
        byte[] plaintText = new byte[1024];
        cipher.doFinal(inbuffer, 0, 1024 - FILE_HEADER_SZ, plaintText, 0);
        outputStream.write(plaintText);
        outputStream.flush();
    }

    public static SecretKey androidPBKDF2(char[] pwArray, byte[] salt, int rounds, boolean useUtf8) {
        PBEParametersGenerator generator = new PKCS5S2ParametersGenerator();
        byte[] pwBytes = useUtf8 ? PBEParametersGenerator.PKCS5PasswordToUTF8Bytes(pwArray)
                : PBEParametersGenerator.PKCS5PasswordToBytes(pwArray);
        generator.init(pwBytes, salt, rounds);
        KeyParameter params = (KeyParameter) generator.generateDerivedParameters(PBKDF2_KEY_SIZE);

        return new SecretKeySpec(params.getKey(), "AES");
    }
    
```








[1]:https://github.com/sqlcipher/sqlcipher-tools/blob/master/decrypt.c
[2]:https://github.com/sqlcipher/sqlcipher-tools/commit/f7a1157b1d7044d0da65c53e6c8b8f15961429b3