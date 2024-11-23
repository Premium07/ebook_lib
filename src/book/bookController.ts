import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModal from "./bookModal";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, genre } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Add null checks before accessing files
  if (!files.coverImage || files.coverImage.length === 0) {
    return next(createHttpError(400, "Cover image is required"));
  }

  if (!files.file || files.file.length === 0) {
    return next(createHttpError(400, "Book file is required"));
  }

  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUpload = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book-pdfs",
      format: "pdf",
    });

    const _req = req as AuthRequest;

    const newBook = await bookModal.create({
      title,
      genre,
      description,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUpload.secure_url,
    });

    // delete temprorary files
    try {
      await fs.promises.unlink(filePath);
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      console.log(error);
    }

    res.status(201).json({ id: newBook._id });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error uploading the files"));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, genre } = req.body;

    const bookId = req.params.bookId;

    const book = await bookModal.findOne({ _id: bookId });

    // find book
    if (!book) {
      return next(createHttpError(404, "Book not found."));
    }

    // check access

    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "Not authorized to do."));
    }

    // check if image field is exists.

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = "";
    try {
      if (files.coverImage) {
        const filename = files.coverImage[0].filename;
        const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);

        // send files to cloudinary

        const filePath = path.resolve(
          __dirname,
          "../../public/data/uploads/" + filename
        );

        completeCoverImage = filename;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          filename_override: completeCoverImage,
          folder: "book-pdfs",
          format: coverMimeType,
        });

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      return next(createHttpError(500, "Error uploading cover image."));
    }

    // check if file field is exists
    let completeFileName = "";
    if (files.file) {
      const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads/" + files.file[0].filename
      );

      const bookFileName = files.file[0].filename;
      completeFileName = bookFileName;

      const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: completeFileName,
        folder: "book-covers",
        format: "pdf",
      });

      completeFileName = uploadResultPdf.secure_url;
      await fs.promises.unlink(bookFilePath);
    }

    const updateBook = await bookModal.findOneAndUpdate(
      {
        _id: bookId,
      },
      {
        title,
        genre,
        description,
        coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
        file: completeFileName ? completeFileName : book.file,
      },
      { new: true }
    );

    res.json(updateBook);
  } catch (error) {
    return next(createHttpError(403, "Not authorized to perform this action."));
  }
};

// const updateBook = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { title, description, genre } = req.body;
//     const bookId = req.params.bookId;

//     // Find the book by ID
//     const book = await bookModal.findOne({ _id: bookId });
//     if (!book) {
//       return next(createHttpError(404, "Book not found."));
//     }

//     // Check access authorization
//     const _req = req as AuthRequest;
//     if (book.author.toString() !== _req.userId) {
//       return next(createHttpError(403, "Not authorized to update this book."));
//     }

//     // Handle file uploads
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//     let updatedCoverImage = book.coverImage;
//     let updatedFile = book.file;

//     // Update cover image if provided
//     if (files?.coverImage?.[0]) {
//       const coverFile = files.coverImage[0];
//       const coverMimeType = coverFile.mimetype.split("/").pop();
//       const coverFilePath = path.resolve(
//         __dirname,
//         "../../public/data/uploads",
//         coverFile.filename
//       );

//       try {
//         const uploadResult = await cloudinary.uploader.upload(coverFilePath, {
//           filename_override: coverFile.filename,
//           folder: "book-covers",
//           format: coverMimeType,
//         });

//         updatedCoverImage = uploadResult.secure_url;

//         // Delete temporary file
//         await fs.promises.unlink(coverFilePath);
//       } catch (error) {
//         console.error("Error uploading cover image:", error);
//         return next(createHttpError(500, "Error uploading cover image."));
//       }
//     }

//     // Update book file if provided
//     if (files?.file?.[0]) {
//       const bookFile = files.file[0];
//       const bookFilePath = path.resolve(
//         __dirname,
//         "../../public/data/uploads",
//         bookFile.filename
//       );

//       try {
//         const uploadResult = await cloudinary.uploader.upload(bookFilePath, {
//           resource_type: "raw",
//           filename_override: bookFile.filename,
//           folder: "book-pdfs",
//           format: "pdf",
//         });

//         updatedFile = uploadResult.secure_url;

//         // Delete temporary file
//         await fs.promises.unlink(bookFilePath);
//       } catch (error) {
//         console.error("Error uploading book file:", error);
//         return next(createHttpError(500, "Error uploading book file."));
//       }
//     }

//     // Update the book record in the database
//     const updatedBook = await bookModal.findByIdAndUpdate(
//       bookId,
//       {
//         title,
//         genre,
//         description,
//         coverImage: updatedCoverImage,
//         file: updatedFile,
//       },
//       { new: true }
//     );

//     res.json(updatedBook);
//   } catch (error) {
//     console.error("Error updating book:", error);
//     return next(
//       createHttpError(500, "An error occurred while updating the book.")
//     );
//   }
// };

const bookList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // todo: Add Pagination

    const allBooks = await bookModal.find({});
    res.json(allBooks);
  } catch (error) {
    return next(createHttpError(500, "Error while getting book."));
  }
};

const singleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const bookId = req.params.bookId;
  try {
    const book = await bookModal.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error while getting a book."));
  }
};

const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const bookId = req.params.bookId;

  try {
    const book = await bookModal.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    //Check access

    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "Not authorized to do."));
    }

    // finding path to delete the files.

    const coverFileSplits = book.coverImage.split("/");
    const coverImagePublicId =
      coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

    const bookFileSplits = book.file.split("/");
    const bookFilePublicId =
      bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
    // console.log(bookFilePublicId);

    try {
      await cloudinary.uploader.destroy(coverImagePublicId);
      await cloudinary.uploader.destroy(bookFilePublicId, {
        resource_type: "raw",
      });

      await bookModal.deleteOne({ _id: bookId });

      res.sendStatus(204);
    } catch (error) {
      return next(createHttpError(500, "Error while excecuting operation."));
    }
  } catch (error) {
    return next(createHttpError(500, "Error while deleting book."));
  }
};

export { createBook, updateBook, bookList, singleBook, deleteBook };
