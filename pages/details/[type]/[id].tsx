import Reviews from "@components/details/Reviews";
import Navbar from "@components/Navbar";
import Image from "next/image";
import { addItem } from "@slices/cartSlice";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Cart from "@components/menu/Cart";
import toast from "react-hot-toast";
import { useCollection } from "react-firebase-hooks/firestore";
import { firestore } from "@lib/firebase";
import { isValidMotionProp, motion } from "framer-motion";
import { itemSlideUp, list, slideToLeft, slideUp } from "@helpers/animation";
import NotFound from "pages/404";

const ItemDetails = () => {
  const router = useRouter();

  const { type, id } = router.query;

  const { items, cart, auth } = useSelector(
    (state: { items: any; cart: any; auth: any }) => ({
      items: state.items,
      cart: state.cart,
      auth: state.auth,
    })
  );

  const item_details = items
    ?.find((item) => item.type === type)
    ?.items?.find((item) => item.id === id);

  const inCart = cart.some((item) => item.id === item_details?.id);

  const dispatch = useDispatch();

  const [openCart, setOpenCart] = useState(false);

  const placeOrder = () => {
    const order = {
      id: item_details.id,
      item_name: item_details.item_name,
      item_image: item_details.item_image,
      price: item_details.price,
      category: item_details.category,
      quantity: 1,
      ingredients: null,
    };

    dispatch(addItem(order));

    toast.success("order added to basket");
  };

  const [reviewsQuery, setQueryReviews] = useState(null);

  useEffect(() => {
    if (id) {
      const query = firestore
        .collectionGroup("reviews")
        .where("item_id", "==", id);

      setQueryReviews(query);
    }
  }, [id]);

  const [realTimeReviews] = useCollection(reviewsQuery);
  const reviews = realTimeReviews?.docs.map((doc) => doc.data());

  return (
    <>
      {!item_details && <NotFound />}
      {item_details && (
        <section className="min-h-screen flex items-center py-20 bg-light_gray">
          <Navbar setOpenCart={setOpenCart} />
          <Cart openCart={openCart} setOpenCart={setOpenCart} />
          <div className="xl:max-w-screen-xl  px-2 mx-auto">
            <div className="grid lg:grid-cols-2 lg:grid-rows-2 grid-cols-1  gap-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={list}
                className="self-center"
              >
                <motion.h1
                  variants={itemSlideUp}
                  className="font-main text-2xl font-bold capitalize mb-2"
                >
                  {item_details.item_name}
                </motion.h1>
                <motion.p
                  variants={itemSlideUp}
                  className="text-md font-poppins text-gray-500 leading-normal mb-4"
                >
                  {item_details.description}
                </motion.p>
                <motion.h2
                  variants={itemSlideUp}
                  className="font-main text-xl font-bold capitalize"
                >
                  Ingredients
                </motion.h2>
                <motion.p
                  variants={itemSlideUp}
                  className="text-md font-poppins text-gray-500 leading-normal mb-4"
                >
                  {item_details.ingredients}
                </motion.p>
              </motion.div>
              <div className="xl:row-span-2 self-center justify-self-center">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={slideToLeft}
                  custom={0.9}
                >
                  <Image
                    src={item_details.item_image}
                    alt="pizza"
                    width={400}
                    height={400}
                  />
                </motion.div>
                <div className="flex justify-between items-center mt-6 flex-col sm:flex-row"></div>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={slideUp}
                  custom={1.2}
                  className="flex items-center justify-between mt-4 flex-col sm:flex-row"
                >
                  <p className="text-md font-main text-xl  text-gray-900 leading-normal ">
                    Price: {item_details.price}$
                  </p>
                  <button
                    disabled={inCart}
                    onClick={placeOrder}
                    className="disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none transition-all hover:shadow-btn_lg shadow-btn  px-4 py-2 font-bold rounded bg-primary text-white font-main uppercase"
                  >
                    {inCart ? "in Cart" : "place order"}
                  </button>
                </motion.div>
              </div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={slideUp}
                custom={1.9}
                className="xl:col-span-1 lg:col-span-2"
              >
                <Reviews
                  dispatch={dispatch}
                  auth={auth}
                  reviews={reviews}
                  itemId={id}
                />
              </motion.div>
            </div>
          </div>
        </section>
      )}
      {!items && <div>Loading...</div>}
    </>
  );
};

export default ItemDetails;
